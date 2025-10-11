# Course Content Architecture - Future Enhancement

## 🎯 Problem
Pre-recorded courses need structured content:
- ✅ **Lessons/Modules** - Video lectures, articles
- ✅ **Exercises** - Practice problems
- ✅ **Quizzes** - Multiple choice, true/false
- ✅ **Finals** - Comprehensive exams
- ✅ **Certificates** - Upon completion

**This REQUIRES separate tables** - cannot be in the course table!

---

## 📊 Recommended Database Architecture

### **1. Course Structure Hierarchy**

```
Course (existing)
  └── Sections/Modules (new table)
        └── Lessons (new table)
              ├── Video Content
              ├── Text Content
              ├── Exercises
              └── Quizzes
```

### **Example:**
```
Course: "Complete Web Development Bootcamp"
  ├── Section 1: "Introduction to HTML"
  │     ├── Lesson 1: "What is HTML?" (Video)
  │     ├── Lesson 2: "HTML Tags Basics" (Video)
  │     ├── Lesson 3: "Practice Exercise" (Exercise)
  │     └── Lesson 4: "HTML Quiz" (Quiz)
  ├── Section 2: "CSS Fundamentals"
  │     ├── Lesson 1: "CSS Selectors" (Video)
  │     └── ...
  └── Final Exam
```

---

## 🗄️ Database Schema Design

### **1. Sections/Modules Table**
```sql
CREATE TABLE course_sections (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL, -- Display order
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_sections_course_id ON course_sections(course_id);
CREATE UNIQUE INDEX idx_course_sections_order ON course_sections(course_id, order_index);
```

**Example Data:**
```sql
INSERT INTO course_sections (course_id, title, description, order_index) VALUES
(1, 'Introduction to HTML', 'Learn the basics of HTML markup', 1),
(1, 'CSS Fundamentals', 'Style your web pages with CSS', 2),
(1, 'JavaScript Basics', 'Add interactivity with JavaScript', 3);
```

---

### **2. Lessons Table (Content Items)**
```sql
CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Content type
    type VARCHAR(50) NOT NULL, -- VIDEO, ARTICLE, QUIZ, EXERCISE, ASSIGNMENT, FINAL_EXAM
    
    -- Video content
    video_url TEXT,
    video_duration_seconds INTEGER, -- 3600 = 1 hour
    video_thumbnail_url TEXT,
    
    -- Article/Text content
    content_html TEXT, -- Rich text content
    
    -- Attachments
    attachments_json JSONB, -- [{name: "slides.pdf", url: "..."}]
    
    -- Settings
    is_preview BOOLEAN DEFAULT FALSE, -- Free preview
    is_required BOOLEAN DEFAULT TRUE, -- Required for completion
    order_index INTEGER NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_section_id ON lessons(section_id);
CREATE UNIQUE INDEX idx_lessons_order ON lessons(section_id, order_index);
CREATE INDEX idx_lessons_type ON lessons(type);
```

**Example Data:**
```sql
INSERT INTO lessons (section_id, title, type, video_url, video_duration_seconds, order_index) VALUES
(1, 'What is HTML?', 'VIDEO', 'https://vimeo.com/123456', 600, 1),
(1, 'HTML Tags Reference', 'ARTICLE', NULL, NULL, 2),
(1, 'HTML Practice', 'EXERCISE', NULL, NULL, 3),
(1, 'HTML Quiz', 'QUIZ', NULL, NULL, 4);
```

---

### **3. Exercises Table**
```sql
CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT,
    
    -- Exercise content
    starter_code TEXT, -- Pre-filled code
    solution_code TEXT, -- Correct solution (hidden from students)
    test_cases_json JSONB, -- Automated tests
    
    -- Difficulty
    difficulty VARCHAR(20), -- EASY, MEDIUM, HARD
    estimated_minutes INTEGER,
    
    -- Points/Grading
    points INTEGER DEFAULT 10,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
```

**Example Data:**
```sql
INSERT INTO exercises (lesson_id, title, instructions, starter_code, difficulty, points) VALUES
(3, 'Build a Simple Webpage', 
    'Create an HTML page with a heading, paragraph, and image',
    '<!DOCTYPE html>\n<html>\n<!-- Your code here -->\n</html>',
    'EASY',
    10
);
```

---

### **4. Quizzes Table**
```sql
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Quiz settings
    passing_score INTEGER DEFAULT 70, -- Percentage
    time_limit_minutes INTEGER, -- NULL = no limit
    attempts_allowed INTEGER DEFAULT 3, -- -1 = unlimited
    randomize_questions BOOLEAN DEFAULT FALSE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    
    -- Grading
    total_points INTEGER DEFAULT 100,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
```

---

### **5. Quiz Questions Table**
```sql
CREATE TABLE quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY
    
    -- Options for multiple choice (JSON array)
    options_json JSONB, -- ["Option A", "Option B", "Option C", "Option D"]
    correct_answer_json JSONB, -- [0] for index 0 (Option A), or [0,2] for multiple correct
    
    -- Points
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    
    -- Explanation
    explanation TEXT, -- Shown after answering
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE UNIQUE INDEX idx_quiz_questions_order ON quiz_questions(quiz_id, order_index);
```

**Example Data:**
```sql
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options_json, correct_answer_json, points, order_index) VALUES
(1, 'What does HTML stand for?', 'MULTIPLE_CHOICE',
    '["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"]',
    '[0]', -- First option is correct
    1,
    1
),
(1, 'HTML is a programming language', 'TRUE_FALSE',
    '["True", "False"]',
    '[1]', -- False is correct
    1,
    2
);
```

---

### **6. Student Progress Tracking**

#### **6a. Lesson Progress**
```sql
CREATE TABLE lesson_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- Progress
    status VARCHAR(50) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
    video_progress_seconds INTEGER DEFAULT 0, -- How far into video
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
```

#### **6b. Exercise Submissions**
```sql
CREATE TABLE exercise_submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    
    -- Submission
    submitted_code TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PASSED, FAILED, GRADING
    score INTEGER, -- Points earned
    feedback TEXT, -- Instructor or automated feedback
    
    -- Test results
    test_results_json JSONB, -- {passed: 5, failed: 2, tests: [...]}
    
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercise_submissions_user_id ON exercise_submissions(user_id);
CREATE INDEX idx_exercise_submissions_exercise_id ON exercise_submissions(exercise_id);
```

#### **6c. Quiz Attempts**
```sql
CREATE TABLE quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    
    -- Attempt info
    attempt_number INTEGER NOT NULL, -- 1, 2, 3...
    score INTEGER, -- Points earned
    percentage NUMERIC(5,2), -- 85.50%
    passed BOOLEAN,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_taken_seconds INTEGER
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE UNIQUE INDEX idx_quiz_attempts_unique ON quiz_attempts(user_id, quiz_id, attempt_number);
```

#### **6d. Quiz Answers**
```sql
CREATE TABLE quiz_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    
    -- Answer
    selected_answer_json JSONB, -- [0] for option index, or ["text answer"]
    is_correct BOOLEAN,
    points_earned INTEGER,
    
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(attempt_id, question_id)
);

CREATE INDEX idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
```

---

### **7. Certificates Table**
```sql
CREATE TABLE certificates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    
    -- Certificate details
    certificate_number VARCHAR(50) UNIQUE NOT NULL, -- CERT-2024-001234
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Verification
    verification_url TEXT, -- Public URL to verify certificate
    
    -- Optional: PDF generation
    pdf_url TEXT, -- Stored certificate PDF
    
    -- Completion data
    completion_percentage NUMERIC(5,2), -- 100.00%
    final_score NUMERIC(5,2), -- 95.50%
    
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_course_id ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
```

---

## 🔄 Complete Data Flow

### **1. Course Creation (Admin)**
```
1. Create Course → course table
2. Add Sections → course_sections table
3. Add Lessons → lessons table
4. Add Quizzes → quizzes table + quiz_questions table
5. Add Exercises → exercises table
```

### **2. Student Learning Journey**
```
1. Enroll in course → enrollments table
2. Start Section 1 → 
3. Watch Lesson 1 (Video) → lesson_progress table (video_progress_seconds updated)
4. Complete Lesson 1 → lesson_progress.status = 'COMPLETED'
5. Take Quiz → quiz_attempts + quiz_answers tables
6. Submit Exercise → exercise_submissions table
7. Complete all lessons → course_progress table updated
8. Pass Final Exam → Check completion criteria
9. Generate Certificate → certificates table
```

---

## 📊 Queries You'll Need

### **1. Get Course Curriculum**
```sql
-- Get full course structure
SELECT 
    c.title as course_title,
    cs.title as section_title,
    cs.order_index as section_order,
    l.title as lesson_title,
    l.type as lesson_type,
    l.video_duration_seconds,
    l.order_index as lesson_order
FROM course c
JOIN course_sections cs ON cs.course_id = c.id
JOIN lessons l ON l.section_id = cs.id
WHERE c.id = 1
ORDER BY cs.order_index, l.order_index;
```

### **2. Get Student Progress**
```sql
-- Calculate course completion percentage
SELECT 
    COUNT(DISTINCT l.id) as total_lessons,
    COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'COMPLETED') as completed_lessons,
    ROUND(
        (COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'COMPLETED')::NUMERIC / 
         COUNT(DISTINCT l.id)::NUMERIC) * 100, 
        2
    ) as completion_percentage
FROM course c
JOIN course_sections cs ON cs.course_id = c.id
JOIN lessons l ON l.section_id = cs.id
LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = 123
WHERE c.id = 1;
```

### **3. Check Certificate Eligibility**
```sql
-- Check if user can get certificate
WITH completion_stats AS (
    SELECT 
        COUNT(DISTINCT l.id) as total_required,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'COMPLETED') as completed
    FROM course c
    JOIN course_sections cs ON cs.course_id = c.id
    JOIN lessons l ON l.section_id = cs.id AND l.is_required = TRUE
    LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = 123
    WHERE c.id = 1
)
SELECT 
    completed = total_required as eligible,
    ROUND((completed::NUMERIC / total_required::NUMERIC) * 100, 2) as percentage
FROM completion_stats;
```

---

## 🎯 Update Existing Tables

### **Update `course_progress` table**
```sql
-- Add more detailed progress tracking
ALTER TABLE course_progress 
    ADD COLUMN sections_completed INTEGER DEFAULT 0,
    ADD COLUMN quizzes_passed INTEGER DEFAULT 0,
    ADD COLUMN exercises_completed INTEGER DEFAULT 0,
    ADD COLUMN total_score INTEGER DEFAULT 0;
```

---

## 📦 Migration Strategy

### **Phase 1: Basic Content (V8 Migration)**
```sql
-- Create tables:
- course_sections
- lessons
- lesson_progress
```

### **Phase 2: Quizzes (V9 Migration)**
```sql
-- Create tables:
- quizzes
- quiz_questions
- quiz_attempts
- quiz_answers
```

### **Phase 3: Exercises (V10 Migration)**
```sql
-- Create tables:
- exercises
- exercise_submissions
```

### **Phase 4: Certificates (V11 Migration)**
```sql
-- Create table:
- certificates
```

---

## 🎯 Why Separate Tables?

### **❌ Why NOT in course table:**
```
❌ Course has 245 lessons → 245 rows duplicating course info
❌ Can't store structured quiz data
❌ Can't track individual lesson progress
❌ Can't have multiple students with different progress
```

### **✅ Why separate tables:**
```
✅ One course → Many sections → Many lessons (proper hierarchy)
✅ Track individual student progress per lesson
✅ Flexible quiz/exercise structure
✅ Scalable to thousands of lessons
✅ Easy to reorder/update content
✅ Clean separation of concerns
```

---

## 📊 Final Table Count

### **Core Tables (Existing):**
- `course` ✅
- `enrollments` ✅
- `course_progress` ✅

### **Content Tables (New):**
- `course_sections` (modules)
- `lessons` (content items)
- `exercises`
- `quizzes`
- `quiz_questions`

### **Progress Tables (New):**
- `lesson_progress`
- `exercise_submissions`
- `quiz_attempts`
- `quiz_answers`

### **Achievements (New):**
- `certificates`

**Total: ~13 tables for full e-learning platform**

---

## ✅ Recommendation

### **For MVP (Now):**
Keep current design (course table only)

### **For Content Launch (Next):**
Implement Phase 1:
- `course_sections`
- `lessons` (VIDEO + ARTICLE types only)
- `lesson_progress`

### **For Full Platform (Later):**
Add quizzes, exercises, certificates

---

## 🚀 Next Steps

When you're ready to add course content:

1. **Create V8 migration** (sections + lessons)
2. **Update Course DTOs** to include sections
3. **Create ContentService** (backend)
4. **Build Course Player** (frontend)
5. **Track progress** as students watch videos
6. **Add quizzes** (V9 migration)
7. **Add certificates** (V11 migration)

This architecture will scale to **millions of lessons** across **thousands of courses**! 🎓

