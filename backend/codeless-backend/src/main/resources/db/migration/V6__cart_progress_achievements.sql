-- V6 Migration: Cart System, Progress Tracking, and Achievements
-- Date: 2025-10-07

-- ============================================================================
-- CART SYSTEM
-- ============================================================================

-- Cart table (one per user, persistent)
CREATE TABLE IF NOT EXISTS cart (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id) -- One cart per user
);

-- Cart items (courses added to cart)
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, course_id) -- Prevent duplicate courses in same cart
);

-- Indexes for cart performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_course_id ON cart_items(course_id);

-- ============================================================================
-- COURSE PROGRESS TRACKING
-- ============================================================================

-- Track user progress in enrolled courses
CREATE TABLE IF NOT EXISTS course_progress (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_completed INT NOT NULL DEFAULT 0,
    lesson_total INT NOT NULL DEFAULT 0,
    time_spent_seconds BIGINT NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    completion_percentage INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(enrollment_id) -- One progress record per enrollment
);

CREATE INDEX IF NOT EXISTS idx_course_progress_enrollment_id ON course_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_completion ON course_progress(completion_percentage);

-- ============================================================================
-- LEARNING STREAK TRACKING
-- ============================================================================

-- Track consecutive learning days
CREATE TABLE IF NOT EXISTS learning_streaks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak_days INT NOT NULL DEFAULT 0,
    longest_streak_days INT NOT NULL DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id) -- One streak record per user
);

CREATE INDEX IF NOT EXISTS idx_learning_streaks_user_id ON learning_streaks(user_id);

-- ============================================================================
-- ACHIEVEMENTS SYSTEM
-- ============================================================================

-- Achievement definitions (system-defined)
CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id) -- User can earn each achievement once
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Seed initial achievements
INSERT INTO achievements (code, name, description, icon_name) VALUES
('course_completer', 'Course Completer', 'Complete your first course', 'trophy'),
('week_streak', 'Week Streak', 'Learn for 7 consecutive days', 'fire'),
('learning_enthusiast', 'Learning Enthusiast', 'Spend 10+ hours learning', 'star')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE cart IS 'Persistent shopping cart for users';
COMMENT ON TABLE cart_items IS 'Items (courses) in user cart';
COMMENT ON TABLE course_progress IS 'Progress tracking for enrolled courses';
COMMENT ON TABLE learning_streaks IS 'Consecutive learning day tracking';
COMMENT ON TABLE achievements IS 'System-defined achievement definitions';
COMMENT ON TABLE user_achievements IS 'Achievements earned by users';

