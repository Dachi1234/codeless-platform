-- =============================================
-- Migration V9: Article, Quiz, and Exercise Content
-- Creates tables for storing rich content for different lesson types
-- =============================================

-- Article Content (for ARTICLE lesson type)
CREATE TABLE article_content (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- HTML content from TinyMCE
    raw_content TEXT, -- Optional: Markdown or plain text backup
    estimated_read_time INTEGER, -- Minutes (auto-calculated)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_lesson_article UNIQUE(lesson_id)
);

CREATE INDEX idx_article_content_lesson_id ON article_content(lesson_id);

-- Quiz Content (for QUIZ lesson type)
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

CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);

-- Quiz Questions
CREATE TABLE quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL, -- MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK, SHORT_ANSWER
    question_text TEXT NOT NULL,
    explanation TEXT, -- Shown after answer
    points INTEGER DEFAULT 1,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_quiz_question_order UNIQUE(quiz_id, question_order)
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Answer Options (for multiple choice questions)
CREATE TABLE quiz_answer_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INTEGER NOT NULL,
    CONSTRAINT unique_question_option_order UNIQUE(question_id, option_order)
);

CREATE INDEX idx_quiz_answer_options_question_id ON quiz_answer_options(question_id);

-- User Quiz Attempts
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

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- User Quiz Answers
CREATE TABLE quiz_user_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_id BIGINT REFERENCES quiz_answer_options(id),
    text_answer TEXT, -- For short answer/fill blank
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0
);

CREATE INDEX idx_quiz_user_answers_attempt_id ON quiz_user_answers(attempt_id);

-- Exercise Content (for EXERCISE lesson type)
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

CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);

-- Exercise Test Cases (for auto-grading)
CREATE TABLE exercise_test_cases (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    input_data TEXT,
    expected_output TEXT,
    is_hidden BOOLEAN DEFAULT FALSE, -- Hidden from students
    points INTEGER DEFAULT 1,
    test_order INTEGER NOT NULL,
    CONSTRAINT unique_exercise_test_order UNIQUE(exercise_id, test_order)
);

CREATE INDEX idx_exercise_test_cases_exercise_id ON exercise_test_cases(exercise_id);

-- User Exercise Submissions
CREATE TABLE exercise_submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    submission_code TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, GRADED, REJECTED
    score NUMERIC(5,2), -- Percentage or points
    instructor_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_exercise_submissions_user_id ON exercise_submissions(user_id);
CREATE INDEX idx_exercise_submissions_exercise_id ON exercise_submissions(exercise_id);

-- Comments
COMMENT ON TABLE article_content IS 'Stores rich text content for ARTICLE lesson type';
COMMENT ON TABLE quizzes IS 'Quiz configuration for QUIZ lesson type';
COMMENT ON TABLE quiz_questions IS 'Questions within a quiz';
COMMENT ON TABLE quiz_answer_options IS 'Answer options for multiple choice questions';
COMMENT ON TABLE quiz_attempts IS 'User attempts at taking quizzes';
COMMENT ON TABLE quiz_user_answers IS 'User answers for each question in an attempt';
COMMENT ON TABLE exercises IS 'Coding exercises for EXERCISE lesson type';
COMMENT ON TABLE exercise_test_cases IS 'Test cases for auto-grading exercises';
COMMENT ON TABLE exercise_submissions IS 'User code submissions for exercises';

