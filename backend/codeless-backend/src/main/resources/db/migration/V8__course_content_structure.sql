-- =============================================
-- Migration V8: Course Content Structure
-- Creates tables for course sections, lessons, and progress tracking
-- =============================================

-- Course Sections (modules/chapters)
CREATE TABLE course_sections (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    section_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_section_order UNIQUE(course_id, section_order)
);

CREATE INDEX idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX idx_course_sections_order ON course_sections(course_id, section_order);

-- Lessons (individual learning units)
CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type VARCHAR(50) NOT NULL DEFAULT 'VIDEO', -- VIDEO, ARTICLE, QUIZ, EXERCISE
    content_url TEXT, -- Video URL, article link, etc.
    duration_minutes INTEGER, -- Estimated duration
    lesson_order INTEGER NOT NULL DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE, -- Can be viewed without enrollment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_section_lesson_order UNIQUE(section_id, lesson_order)
);

CREATE INDEX idx_lessons_section_id ON lessons(section_id);
CREATE INDEX idx_lessons_order ON lessons(section_id, lesson_order);
CREATE INDEX idx_lessons_type ON lessons(lesson_type);

-- Lesson Progress (track user completion)
CREATE TABLE lesson_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_position_seconds INTEGER DEFAULT 0, -- For video playback position
    time_spent_seconds INTEGER DEFAULT 0, -- Total time spent on lesson
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_lesson_progress UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed);

-- Update course lesson_count based on actual lessons
-- This can be used as a trigger or computed field later
COMMENT ON COLUMN course.lesson_count IS 'Total number of lessons in this course (should match COUNT of lessons)';

-- =============================================
-- Seed Sample Course Content
-- =============================================

-- Get course IDs for seeding (we'll use first 3 courses)
DO $$
DECLARE
    course_java_id BIGINT;
    course_marketing_id BIGINT;
    course_python_id BIGINT;
    section_id BIGINT;
BEGIN
    -- Get course IDs
    SELECT id INTO course_java_id FROM course WHERE title LIKE '%Java%' LIMIT 1;
    SELECT id INTO course_marketing_id FROM course WHERE title LIKE '%Marketing%' LIMIT 1;
    SELECT id INTO course_python_id FROM course WHERE title LIKE '%Python%' LIMIT 1;

    -- =============================================
    -- Course 1: Java Fundamentals (PRE_RECORDED)
    -- =============================================
    IF course_java_id IS NOT NULL THEN
        -- Section 1: Introduction
        INSERT INTO course_sections (course_id, title, description, section_order) 
        VALUES (course_java_id, 'Getting Started with Java', 'Learn the basics of Java programming', 1)
        RETURNING id INTO section_id;
        
        INSERT INTO lessons (section_id, title, description, lesson_type, content_url, duration_minutes, lesson_order, is_preview) VALUES
        (section_id, 'Welcome to Java', 'Introduction to the course and Java ecosystem', 'VIDEO', 'https://www.youtube.com/embed/eIrMbAQSU34', 5, 1, TRUE),
        (section_id, 'Setting Up Your Environment', 'Install JDK and IDE', 'VIDEO', 'https://www.youtube.com/embed/IJ-PJbvJBGs', 15, 2, TRUE),
        (section_id, 'Your First Java Program', 'Write and run Hello World', 'VIDEO', 'https://www.youtube.com/embed/RRubcjpTkks', 20, 3, FALSE);

        -- Section 2: Java Basics
        INSERT INTO course_sections (course_id, title, description, section_order) 
        VALUES (course_java_id, 'Java Fundamentals', 'Core Java concepts', 2)
        RETURNING id INTO section_id;
        
        INSERT INTO lessons (section_id, title, description, lesson_type, content_url, duration_minutes, lesson_order) VALUES
        (section_id, 'Variables and Data Types', 'Understanding primitive and reference types', 'VIDEO', 'https://www.youtube.com/embed/so1iUWaLmKA', 25, 1),
        (section_id, 'Control Flow Statements', 'If-else, switch, loops', 'VIDEO', 'https://www.youtube.com/embed/ldYLYRNaucM', 30, 2),
        (section_id, 'Practice Exercise: Calculator', 'Build a simple calculator', 'EXERCISE', NULL, 45, 3);

        -- Section 3: Object-Oriented Programming
        INSERT INTO course_sections (course_id, title, description, section_order) 
        VALUES (course_java_id, 'Object-Oriented Programming', 'OOP principles in Java', 3)
        RETURNING id INTO section_id;
        
        INSERT INTO lessons (section_id, title, description, lesson_type, content_url, duration_minutes, lesson_order) VALUES
        (section_id, 'Classes and Objects', 'Creating and using classes', 'VIDEO', 'https://www.youtube.com/embed/IUqKuGNasdM', 35, 1),
        (section_id, 'Inheritance and Polymorphism', 'Advanced OOP concepts', 'VIDEO', 'https://www.youtube.com/embed/9JpNY-XAseg', 40, 2),
        (section_id, 'Final Project', 'Build a complete application', 'EXERCISE', NULL, 120, 3);

        -- Update lesson count
        UPDATE course SET lesson_count = 9 WHERE id = course_java_id;
    END IF;

    -- =============================================
    -- Course 2: Digital Marketing (LIVE)
    -- =============================================
    IF course_marketing_id IS NOT NULL THEN
        -- Section 1: Marketing Fundamentals
        INSERT INTO course_sections (course_id, title, description, section_order) 
        VALUES (course_marketing_id, 'Marketing Foundations', 'Core marketing principles', 1)
        RETURNING id INTO section_id;
        
        INSERT INTO lessons (section_id, title, description, lesson_type, content_url, duration_minutes, lesson_order, is_preview) VALUES
        (section_id, 'Introduction to Digital Marketing', 'Overview of digital marketing landscape', 'VIDEO', 'https://www.youtube.com/embed/nU-IIXBWlS4', 15, 1, TRUE),
        (section_id, 'Understanding Your Audience', 'Market research and personas', 'ARTICLE', 'https://example.com/audience-research', 20, 2, FALSE);

        -- Section 2: SEO & Content
        INSERT INTO course_sections (course_id, title, description, section_order) 
        VALUES (course_marketing_id, 'SEO & Content Strategy', 'Search engine optimization', 2)
        RETURNING id INTO section_id;
        
        INSERT INTO lessons (section_id, title, description, lesson_type, content_url, duration_minutes, lesson_order) VALUES
        (section_id, 'SEO Fundamentals', 'How search engines work', 'VIDEO', 'https://www.youtube.com/embed/hF515-0Tduk', 30, 1),
        (section_id, 'Keyword Research', 'Finding the right keywords', 'VIDEO', 'https://www.youtube.com/embed/3pv9KLejcZI', 25, 2),
        (section_id, 'Content Marketing Strategy', 'Creating valuable content', 'ARTICLE', 'https://example.com/content-strategy', 30, 3);

        -- Update lesson count
        UPDATE course SET lesson_count = 5 WHERE id = course_marketing_id;
    END IF;

    -- =============================================
    -- Course 3: Python for Data Science (PRE_RECORDED)
    -- =============================================
    IF course_python_id IS NOT NULL THEN
        -- Section 1: Python Basics
        INSERT INTO course_sections (course_id, title, description, section_order) 
        VALUES (course_python_id, 'Python Essentials', 'Getting started with Python', 1)
        RETURNING id INTO section_id;
        
        INSERT INTO lessons (section_id, title, description, lesson_type, content_url, duration_minutes, lesson_order, is_preview) VALUES
        (section_id, 'Python Installation & Setup', 'Setting up Python environment', 'VIDEO', 'https://www.youtube.com/embed/YYXdXT2l-Gg', 10, 1, TRUE),
        (section_id, 'Python Syntax Basics', 'Variables, loops, functions', 'VIDEO', 'https://www.youtube.com/embed/kqtD5dpn9C8', 30, 2, FALSE);

        -- Section 2: Data Analysis
        INSERT INTO course_sections (course_id, title, description, section_order) 
        VALUES (course_python_id, 'Data Analysis with Pandas', 'Working with data in Python', 2)
        RETURNING id INTO section_id;
        
        INSERT INTO lessons (section_id, title, description, lesson_type, content_url, duration_minutes, lesson_order) VALUES
        (section_id, 'Introduction to Pandas', 'DataFrames and Series', 'VIDEO', 'https://www.youtube.com/embed/vmEHCJofslg', 35, 1),
        (section_id, 'Data Cleaning', 'Handling missing data', 'VIDEO', 'https://www.youtube.com/embed/PYRhfVzd0_w', 40, 2),
        (section_id, 'Practice: Analyze Real Dataset', 'Hands-on data analysis', 'EXERCISE', NULL, 60, 3);

        -- Update lesson count
        UPDATE course SET lesson_count = 5 WHERE id = course_python_id;
    END IF;
END $$;

-- =============================================
-- Comments
-- =============================================
COMMENT ON TABLE course_sections IS 'Organizes course content into sections/modules';
COMMENT ON TABLE lessons IS 'Individual learning units (videos, articles, quizzes, exercises)';
COMMENT ON TABLE lesson_progress IS 'Tracks user progress through lessons';

