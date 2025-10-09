# 📝 Content Builders Implementation Plan

**Created**: October 9, 2025, 01:30  
**Status**: Planning Phase  
**Priority**: HIGH

---

## 🎯 **Overview**

Currently, the curriculum editor supports 4 lesson types, but only VIDEO has a functional content editor. We need to implement builders for:
- 📄 **ARTICLE** - Rich text editor for written content
- ❓ **QUIZ** - Interactive quiz builder with multiple question types
- ✏️ **EXERCISE** - Coding exercises or practice assignments

---

## 📄 **1. ARTICLE Builder**

### **Features Required**:
- ✅ Rich text editor (WYSIWYG)
- ✅ Support for:
  - Text formatting (bold, italic, underline, headers)
  - Lists (ordered, unordered)
  - Links
  - Images
  - Code blocks (syntax highlighting)
  - Blockquotes
  - Tables
- ✅ Preview mode
- ✅ Save as HTML/Markdown
- ✅ Auto-save drafts

### **Technology Options**:

#### **Option 1: TinyMCE** (Recommended)
- ✅ Most popular WYSIWYG editor
- ✅ Free tier available
- ✅ Easy Angular integration
- ✅ Plugins for images, code, tables
- ✅ Mobile-friendly

**Installation**:
```bash
npm install --save tinymce @tinymce/tinymce-angular
```

#### **Option 2: Quill**
- ✅ Lightweight
- ✅ Good for simple articles
- ❌ Fewer features than TinyMCE

#### **Option 3: CKEditor**
- ✅ Feature-rich
- ❌ More complex setup
- ❌ Heavier bundle size

### **Database Schema**:
```sql
-- Option 1: Store in lessons.content_url as data URI
-- Option 2: Create article_content table
CREATE TABLE article_content (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- HTML content
    raw_content TEXT, -- Markdown or plain text
    estimated_read_time INTEGER, -- Minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_lesson_article UNIQUE(lesson_id)
);
```

### **Implementation Steps**:
1. Install TinyMCE
2. Create `ArticleEditorComponent`
3. Integrate into curriculum editor modal
4. Add backend API for saving article content
5. Create `ArticleViewerComponent` for course-learn page
6. Add read time calculator

**Estimated Time**: 4-6 hours

---

## ❓ **2. QUIZ Builder**

### **Features Required**:
- ✅ Multiple question types:
  - Multiple choice (single answer)
  - Multiple choice (multiple answers)
  - True/False
  - Fill in the blank
  - Short answer (text input)
  - Code completion (optional)
- ✅ Question bank
- ✅ Randomize questions
- ✅ Time limits (optional)
- ✅ Passing score threshold
- ✅ Immediate feedback vs end-of-quiz
- ✅ Explanation for correct answers
- ✅ Retry limits

### **Database Schema**:
```sql
-- Quizzes table
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70, -- Percentage
    time_limit_minutes INTEGER, -- NULL = no limit
    randomize_questions BOOLEAN DEFAULT FALSE,
    show_feedback_immediately BOOLEAN DEFAULT TRUE,
    max_attempts INTEGER, -- NULL = unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_lesson_quiz UNIQUE(lesson_id)
);

-- Questions table
CREATE TABLE quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL, -- MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK, SHORT_ANSWER
    question_text TEXT NOT NULL,
    explanation TEXT, -- Shown after answer
    points INTEGER DEFAULT 1,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Answer options (for multiple choice)
CREATE TABLE quiz_answer_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INTEGER NOT NULL
);

-- User quiz attempts
CREATE TABLE quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score NUMERIC(5,2), -- Percentage
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER,
    passed BOOLEAN DEFAULT FALSE
);

-- User answers
CREATE TABLE quiz_user_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_id BIGINT REFERENCES quiz_answer_options(id),
    text_answer TEXT, -- For short answer/fill blank
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
```

### **Implementation Steps**:
1. Create database migration
2. Create backend entities (Quiz, Question, AnswerOption, etc.)
3. Create backend CRUD APIs
4. Create `QuizBuilderComponent` (admin)
   - Add/edit/delete questions
   - Drag & drop question reordering
   - Question type selector
   - Answer option management
5. Create `QuizTakerComponent` (student)
   - Display questions
   - Track time
   - Submit answers
   - Show results
6. Add analytics (question difficulty, common mistakes)

**Estimated Time**: 12-16 hours

---

## ✏️ **3. EXERCISE Builder**

### **Features Required**:
- ✅ Instructions editor (rich text)
- ✅ Starter code (optional)
- ✅ Solution code (for instructors)
- ✅ Test cases (automated grading)
- ✅ File uploads (for submissions)
- ✅ Code playground integration (optional)
  - CodeSandbox
  - Replit
  - StackBlitz
- ✅ Manual grading by instructor
- ✅ Peer review (optional)

### **Database Schema**:
```sql
-- Exercises table
CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL, -- HTML
    starter_code TEXT,
    solution_code TEXT, -- Only visible to instructors
    programming_language VARCHAR(50), -- javascript, python, java, etc.
    estimated_time_minutes INTEGER,
    difficulty VARCHAR(20), -- EASY, MEDIUM, HARD
    auto_grading BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_lesson_exercise UNIQUE(lesson_id)
);

-- Test cases (for auto-grading)
CREATE TABLE exercise_test_cases (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    input_data TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE, -- Hidden from students
    points INTEGER DEFAULT 1,
    test_order INTEGER NOT NULL
);

-- User submissions
CREATE TABLE exercise_submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    submission_code TEXT NOT NULL,
    status VARCHAR(50), -- PENDING, GRADED, REJECTED
    score NUMERIC(5,2), -- Percentage or points
    instructor_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_submissions_user ON exercise_submissions(user_id);
CREATE INDEX idx_submissions_exercise ON exercise_submissions(exercise_id);
```

### **Implementation Steps**:
1. Create database migration
2. Create backend entities and APIs
3. Create `ExerciseBuilderComponent` (admin)
   - Instructions editor (TinyMCE)
   - Code editor (Monaco/CodeMirror)
   - Test case management
4. Create `ExerciseViewerComponent` (student)
   - Display instructions
   - Code editor for submission
   - Run tests button
   - Submit button
5. (Optional) Integrate with code playground APIs

**Estimated Time**: 10-14 hours

---

## 🚀 **Implementation Priority**

### **Phase 1: Article Builder** ✅ **COMPLETE**
- Easiest to implement
- Immediate value
- Foundation for other rich content
- **Status**: Implemented with TinyMCE, fully functional

### **Phase 2: Quiz Builder** ✅ **COMPLETE**
- Most requested feature
- Increases engagement
- Automated assessment
- **Status**: Fully implemented with 4 question types, auto-grading, results, and retake functionality

### **Phase 3: Exercise Builder** ⏳ **NEXT**
- Requires code execution (security concerns)
- Consider 3rd-party integration
- Manual grading as interim solution
- **Status**: Pending implementation

---

## 📦 **Technology Stack**

### **Frontend Dependencies**:
```json
{
  "tinymce": "^6.8.0",
  "@tinymce/tinymce-angular": "^8.0.0",
  "monaco-editor": "^0.45.0" // For code editing
}
```

### **Backend Dependencies**:
```xml
<!-- No new dependencies needed -->
<!-- Use existing Spring Boot, JPA, PostgreSQL -->
```

---

## 🎯 **Recommended Approach**

### **Start with Article Builder (Now)**:
1. Install TinyMCE
2. Create simple article content table
3. Build article editor modal
4. Integrate into curriculum editor
5. Create article viewer for students

**Time to MVP**: 3-4 hours

Then proceed with Quiz Builder and Exercise Builder in separate phases.

---

## ❓ **Questions for You**

1. **Which builder should we start with?**
   - Article (easiest, 3-4 hours)
   - Quiz (medium, 12-16 hours)
   - Exercise (hardest, 10-14 hours)

2. **For Article Builder**:
   - Store content in database or as files?
   - Need image upload support?
   - Markdown or HTML?

3. **For Quiz Builder**:
   - Which question types are must-have?
   - Auto-grading only or manual review?
   - Randomization needed?

4. **For Exercise Builder**:
   - Which programming languages to support?
   - Need automated code execution?
   - Or manual grading only for now?

---

**Ready to start? Let me know which builder you want to implement first!** 🚀


