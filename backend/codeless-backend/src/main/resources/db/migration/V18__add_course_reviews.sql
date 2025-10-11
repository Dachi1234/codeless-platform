-- Add course reviews system
CREATE TABLE course_reviews (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id) -- One review per user per course
);

-- Add indexes for performance
CREATE INDEX idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX idx_course_reviews_rating ON course_reviews(rating);

-- Note: courses table already has 'rating' and 'review_count' columns
-- We'll use 'rating' as the average rating (same as 'average_rating')
-- No ALTER TABLE needed for courses

-- Add comments for clarity
COMMENT ON TABLE course_reviews IS 'User reviews and ratings for courses. Only users who purchased the course can leave a review.';
COMMENT ON COLUMN course_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN course_reviews.review_text IS 'Optional text review';
COMMENT ON COLUMN course.rating IS 'Calculated average rating (1.00 - 5.00)';
COMMENT ON COLUMN course.review_count IS 'Total number of reviews';

