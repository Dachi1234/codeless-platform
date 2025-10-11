# 🧩 Quiz System Documentation

**Last Updated**: October 10, 2025  
**Status**: ✅ **FULLY FUNCTIONAL** (Multiple choice, True/False, Fill-in-blank, Short answer)

---

## 📋 Overview

The Quiz System allows administrators to create comprehensive quizzes with multiple question types and automatic grading. Students can take quizzes with a clean, focused interface and receive instant feedback.

### **Key Features**
- ✅ 4 question types (Multiple Choice, True/False, Fill-in-blank, Short Answer)
- ✅ Multiple correct answers for Multiple Choice questions
- ✅ Auto-grading for MC, True/False, and Fill-in-blank
- ✅ Manual grading for Short Answer (essay) questions
- ✅ Time limits and max attempts
- ✅ Progress tracking and attempt history
- ✅ Instant feedback mode
- ✅ Question explanations

---

## 🎯 Question Types

### **1. Multiple Choice**
- **UI**: Checkboxes (can select multiple)
- **Grading**: Auto-graded (compares all selected options)
- **Correct Answers**: Supports multiple correct answers
- **Admin UI**: Checkboxes to mark correct options
- **Student UI**: "Select all that apply" hint

### **2. True/False**
- **UI**: Radio buttons (single selection)
- **Grading**: Auto-graded
- **Correct Answers**: One correct answer (True or False)
- **Admin UI**: Radio buttons to mark correct answer
- **Student UI**: Two options to choose from

### **3. Fill-in-the-Blank**
- **UI**: Text input field
- **Grading**: Auto-graded (case-insensitive)
- **Correct Answers**: Comma-separated acceptable answers
- **Admin UI**: Text input for acceptable answers (e.g., "Paris,paris,PARIS")
- **Student UI**: Single-line text input
- **Examples**: "4,four,Four" or "Washington,washington,DC"

### **4. Short Answer (Essay)**
- **UI**: Multi-line textarea
- **Grading**: Manual (requires instructor review)
- **Correct Answers**: N/A
- **Admin UI**: Can add model answer for reference
- **Student UI**: Large text area for detailed responses

---

## 🏗️ System Architecture

### **Backend Components**

#### **Domain Entities**
| Entity | Purpose |
|--------|---------|
| `Quiz` | Quiz configuration (title, passing score, time limit, etc.) |
| `QuizQuestion` | Questions with type, text, points, explanation |
| `QuizAnswerOption` | Answer options for MC/TF questions + acceptable answers for Fill-blank |
| `QuizAttempt` | User quiz attempts with score and completion time |
| `QuizUserAnswer` | Individual answers (selectedOptionId OR selectedOptionIds OR textAnswer) |

#### **Key Fields (Oct 10, 2025 Updates)**
```java
// QuizAnswerOption.java
@Column(name = "acceptable_answers", columnDefinition = "TEXT")
private String acceptableAnswers; // For FILL_BLANK: "Paris,paris,PARIS"

// QuizUserAnswer.java
@Column(name = "selected_option_ids", columnDefinition = "TEXT")
private String selectedOptionIds; // For MULTIPLE_CHOICE: "1,3,5"
```

#### **Repositories**
- `QuizRepository` - Quiz CRUD with eager loading
- `QuizQuestionRepository` - Question management with ordering
- `QuizAnswerOptionRepository` - Answer option management
- `QuizAttemptRepository` - Attempt tracking and history
- `QuizUserAnswerRepository` - Answer storage

#### **Controllers**

**AdminQuizController** (`/api/admin/quizzes`)
- `POST /api/admin/quizzes` - Create quiz
- `PUT /api/admin/quizzes/{id}` - Update quiz
- `DELETE /api/admin/quizzes/{id}` - Delete quiz
- `POST /api/admin/quizzes/{id}/questions` - Add question
- `PUT /api/admin/quizzes/{id}/questions/{qid}` - Update question (can change type!)
- `DELETE /api/admin/quizzes/{id}/questions/{qid}` - Delete question

**QuizController** (`/api/quizzes`)
- `GET /api/quizzes/{id}` - Get quiz for taking (without correct answers)
- `POST /api/quizzes/start` - Start new attempt
- `POST /api/quizzes/submit` - Submit answers and get graded
- `GET /api/quizzes/attempts/{attemptId}` - View results

---

### **Frontend Components**

#### **Quiz Builder** (`quiz-builder.component`)
**Location**: `frontend/src/app/components/quiz-builder/`

**Features**:
- Create/edit quiz settings (title, description, passing score, time limit, max attempts)
- Add/edit/delete questions
- **Multiple correct answers** - checkboxes for MC questions
- **Acceptable answers** - text input for Fill-blank questions
- Question type selection (can change when editing)
- Points per question
- Question explanations
- Visual question cards with type badges
- Reorder questions

**UI Improvements (Oct 10, 2025)**:
- ✅ Checkboxes for marking multiple correct answers
- ✅ Input field for acceptable answers (Fill-blank)
- ✅ "Select all that apply" instructions
- ✅ Can update question types when editing
- ✅ Removed "Randomize Questions" toggle (not needed for MVP)

#### **Quiz Taker** (`quiz-taker.component`)
**Location**: `frontend/src/app/components/quiz-taker/`

**Features**:
- Quiz introduction screen (question count, passing score, attempts)
- Interactive quiz taking with navigation
- Progress bar and question indicators
- Timer countdown (auto-submit on timeout)
- Answer selection based on question type
- Submit validation (all questions answered)
- Clean, focused UI

**UI by Question Type**:
- **Multiple Choice**: ✅ Checkboxes + "Select all that apply" hint
- **True/False**: ⭕ Radio buttons (single selection)
- **Fill-blank**: 📝 Text input field
- **Short Answer**: 📄 Textarea (multi-line)

**UI Improvements (Oct 10, 2025)**:
- ✅ Checkboxes for Multiple Choice (was radio buttons)
- ✅ Hint text: "Select all that apply"
- ✅ Validation: At least one option selected for MC
- ✅ Separate UI for each question type

#### **Quiz Results** (`quiz-results.component`)
**Location**: `frontend/src/app/components/quiz-results/`

**Features**:
- Score display with pass/fail indicator
- Question-by-question review
- Show correct/incorrect answers
- Question explanations
- Time spent
- Retake button (if attempts remaining)

---

## 💾 Database Schema

### **Migration V17** (October 10, 2025)
```sql
-- Add acceptable_answers for FILL_BLANK questions
ALTER TABLE quiz_answer_options
ADD COLUMN IF NOT EXISTS acceptable_answers TEXT;
COMMENT ON COLUMN quiz_answer_options.acceptable_answers IS 'Comma-separated acceptable answers';

-- Add selected_option_ids for MULTIPLE_CHOICE questions
ALTER TABLE quiz_user_answers
ADD COLUMN IF NOT EXISTS selected_option_ids TEXT;
COMMENT ON COLUMN quiz_user_answers.selected_option_ids IS 'Comma-separated option IDs';
```

### **Table Relationships**
```
Quiz (1) ──────> (N) QuizQuestion
                      │
                      ├──> (N) QuizAnswerOption
                      └──> (N) QuizUserAnswer

QuizAttempt (1) ──> (N) QuizUserAnswer
```

---

## 🔧 Grading Logic

### **Auto-Graded Question Types**

#### **Multiple Choice**
```java
// Compare sorted selected option IDs with sorted correct option IDs
List<Long> selectedIds = answer.getSelectedOptionIdsList(); // [1, 3, 5]
List<Long> correctIds = correctOptions.stream()
    .map(QuizAnswerOption::getId)
    .sorted()
    .collect(Collectors.toList()); // [1, 3, 5]

boolean isCorrect = selectedIds.equals(correctIds);
```

#### **True/False**
```java
// Compare single selected option ID
Long selectedId = answer.getSelectedOptionId();
Long correctId = correctOptions.get(0).getId();

boolean isCorrect = selectedId.equals(correctId);
```

#### **Fill-in-the-Blank**
```java
// Case-insensitive match against acceptable answers
String userAnswer = answer.getTextAnswer().trim();
String[] acceptableAnswers = option.getAcceptableAnswers().split(",");

boolean isCorrect = Arrays.stream(acceptableAnswers)
    .anyMatch(acceptable -> acceptable.trim().equalsIgnoreCase(userAnswer));
```

### **Manual Grading**
- **Short Answer**: Instructor must review and assign points manually
- Stored as text, no auto-grading

---

## 📱 User Workflows

### **Admin: Creating a Quiz**
1. Navigate to Admin → Courses → {Course} → Curriculum
2. Add lesson of type "QUIZ"
3. Click "Build Quiz"
4. Fill in quiz settings (title, passing score, time limit, max attempts)
5. Click "Create Quiz"
6. Click "+ Add Question"
7. Select question type
8. Enter question text and points
9. **For Multiple Choice**: Add options, check multiple correct answers
10. **For Fill-blank**: Enter acceptable answers (comma-separated)
11. **For True/False**: Add True/False options, select correct one
12. **For Short Answer**: Just enter question text
13. Save question
14. Repeat for more questions
15. Done!

### **Student: Taking a Quiz**
1. Navigate to Course Learning page
2. Click on Quiz lesson in curriculum
3. Review quiz intro (question count, time limit, attempts)
4. Click "Start Quiz"
5. Answer questions:
   - **Multiple Choice**: Check all correct answers
   - **True/False**: Select one option
   - **Fill-blank**: Type answer
   - **Short Answer**: Write detailed response
6. Navigate between questions
7. Submit when all answered
8. View results immediately (if instant feedback enabled)
9. Review correct/incorrect answers
10. Retake if needed (and attempts remaining)

---

## 🎨 UI/UX Features

### **Quiz Builder**
- ✅ Clean, card-based layout
- ✅ Visual question type badges (color-coded)
- ✅ Inline editing for questions
- ✅ Checkboxes for multiple correct answers
- ✅ Hint text and instructions
- ✅ Delete confirmation
- ✅ Responsive design

### **Quiz Taker**
- ✅ Progress bar showing answered questions
- ✅ Question indicator grid (current/answered status)
- ✅ Timer with warning when < 60 seconds
- ✅ "Select all that apply" hint for MC
- ✅ Disabled submit until all answered
- ✅ Keyboard navigation
- ✅ Auto-submit on timeout

### **Quiz Results**
- ✅ Pass/fail indicator (visual)
- ✅ Score percentage
- ✅ Question-by-question breakdown
- ✅ Correct answer display
- ✅ Explanation display (if provided)
- ✅ Retake button

---

## 🚀 Recent Improvements (Oct 10, 2025)

### **✅ Multiple Correct Answers for Multiple Choice**
- Changed from radio buttons to checkboxes in both builder and taker
- Backend now compares full list of selected options
- Database stores comma-separated option IDs
- Admin can mark multiple options as correct

### **✅ Fill-in-the-Blank Auto-Grading**
- New question type with text input
- Case-insensitive matching
- Support for multiple acceptable answers (synonyms, variations)
- Examples: "Paris,paris,PARIS" or "4,four,Four"

### **✅ Question Type Editing**
- Can now change question type when updating existing questions
- Options are cleared and re-created when type changes
- Prevents data inconsistency

### **✅ UI/UX Improvements**
- "Select all that apply" hint for Multiple Choice
- Visual distinction between question types
- Better validation (at least one option selected for MC)
- Removed unused features (Randomize Questions)

---

## 📊 Testing Checklist

- [x] Create Multiple Choice quiz with multiple correct answers
- [x] Create True/False quiz
- [x] Create Fill-in-blank quiz with acceptable answers
- [x] Create Short Answer quiz
- [x] Edit question and change type
- [x] Take quiz and select multiple options for MC
- [x] Take quiz and submit fill-blank answer
- [x] Submit quiz and view results
- [x] Retake quiz
- [x] Timer auto-submit
- [x] Max attempts validation

---

## 🐛 Known Limitations

- ⚠️ No question bank or question reuse across quizzes
- ⚠️ No randomization of questions or answer options
- ⚠️ Short Answer grading is fully manual (no AI assistance)
- ⚠️ No partial credit for Multiple Choice questions
- ⚠️ Fill-blank matching is simple string comparison (no fuzzy matching)

---

## 🔮 Future Enhancements

- [ ] Question bank for reusable questions
- [ ] Question randomization
- [ ] Answer option shuffling
- [ ] Partial credit for MC questions
- [ ] Image/video support in questions
- [ ] LaTeX/Math equation support
- [ ] Quiz analytics (difficulty, discrimination index)
- [ ] Timed per-question limits
- [ ] Question tags and categories

---

**🎉 Quiz System is fully functional and production-ready!**

