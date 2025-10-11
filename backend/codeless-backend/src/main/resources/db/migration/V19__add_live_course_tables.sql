-- ============================================================================
-- Migration V19: Live Course Functionality
-- ============================================================================
-- Description: Adds tables for live course sessions, materials, assignments,
--              and student submissions.
-- Date: 2025-10-11
-- ============================================================================

-- ============================================================================
-- Table: live_session
-- Description: Individual live sessions within a live course (Zoom meetings)
-- ============================================================================
CREATE TABLE live_session (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    session_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 90,
    zoom_link VARCHAR(500),
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, COMPLETED, CANCELLED
    recording_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_session UNIQUE(course_id, session_number),
    CONSTRAINT check_duration CHECK (duration_minutes > 0),
    CONSTRAINT check_status CHECK (status IN ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_live_session_course_id ON live_session(course_id);
CREATE INDEX idx_live_session_scheduled_at ON live_session(scheduled_at);
CREATE INDEX idx_live_session_status ON live_session(status);

COMMENT ON TABLE live_session IS 'Individual live sessions (Zoom meetings) within a live course';
COMMENT ON COLUMN live_session.session_number IS 'Sequential session number (1, 2, 3...)';
COMMENT ON COLUMN live_session.scheduled_at IS 'When the session is scheduled to start';
COMMENT ON COLUMN live_session.duration_minutes IS 'Expected duration in minutes';
COMMENT ON COLUMN live_session.zoom_link IS 'Zoom meeting URL for students to join';
COMMENT ON COLUMN live_session.status IS 'Current status: SCHEDULED (future), LIVE (happening now), COMPLETED (ended), CANCELLED';
COMMENT ON COLUMN live_session.recording_url IS 'URL to session recording (Zoom Cloud or YouTube)';

-- ============================================================================
-- Table: session_material
-- Description: Files uploaded for live sessions (PDFs, Excel, images, etc.)
-- ============================================================================
CREATE TABLE session_material (
    id BIGSERIAL PRIMARY KEY,
    live_session_id BIGINT NOT NULL REFERENCES live_session(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), -- pdf, excel, image, html, zip, etc.
    file_size_kb INT,
    uploaded_by BIGINT REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_material_session_id ON session_material(live_session_id);
CREATE INDEX idx_session_material_uploaded_by ON session_material(uploaded_by);

COMMENT ON TABLE session_material IS 'Files shared during/after live sessions (slides, PDFs, spreadsheets, etc.)';
COMMENT ON COLUMN session_material.file_type IS 'Type of file: pdf, excel, word, image, html, zip, etc.';
COMMENT ON COLUMN session_material.file_size_kb IS 'File size in kilobytes';
COMMENT ON COLUMN session_material.file_url IS 'Cloudinary URL or direct link to file';

-- ============================================================================
-- Table: assignment
-- Description: Homework/projects for students to complete and submit
-- ============================================================================
CREATE TABLE assignment (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    live_session_id BIGINT REFERENCES live_session(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    max_file_size_mb INT DEFAULT 50,
    allowed_file_types VARCHAR(255), -- comma-separated list: pdf,docx,zip
    max_grade INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_max_grade CHECK (max_grade > 0),
    CONSTRAINT check_max_file_size CHECK (max_file_size_mb > 0 AND max_file_size_mb <= 100)
);

CREATE INDEX idx_assignment_course_id ON assignment(course_id);
CREATE INDEX idx_assignment_session_id ON assignment(live_session_id);
CREATE INDEX idx_assignment_due_date ON assignment(due_date);

COMMENT ON TABLE assignment IS 'Assignments/homework for live courses';
COMMENT ON COLUMN assignment.live_session_id IS 'Optional link to specific session (can be NULL for general assignments)';
COMMENT ON COLUMN assignment.due_date IS 'Deadline for submission (late submissions allowed but marked)';
COMMENT ON COLUMN assignment.max_file_size_mb IS 'Maximum file size allowed per submission (in MB)';
COMMENT ON COLUMN assignment.allowed_file_types IS 'Comma-separated list of allowed extensions (e.g., pdf,docx,zip)';
COMMENT ON COLUMN assignment.max_grade IS 'Maximum score (e.g., 100 points)';

-- ============================================================================
-- Table: submission
-- Description: Student assignment submissions with grading
-- ============================================================================
CREATE TABLE submission (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignment(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT FALSE,
    days_late INT DEFAULT 0,
    grade INT,
    feedback TEXT,
    graded_at TIMESTAMP,
    graded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_assignment UNIQUE(assignment_id, user_id),
    CONSTRAINT check_days_late CHECK (days_late >= 0)
);

CREATE INDEX idx_submission_assignment_id ON submission(assignment_id);
CREATE INDEX idx_submission_user_id ON submission(user_id);
CREATE INDEX idx_submission_is_late ON submission(is_late);
CREATE INDEX idx_submission_graded_at ON submission(graded_at);

COMMENT ON TABLE submission IS 'Student submissions for assignments with grading info';
COMMENT ON COLUMN submission.file_url IS 'Cloudinary URL to uploaded file';
COMMENT ON COLUMN submission.is_late IS 'TRUE if submitted after due date';
COMMENT ON COLUMN submission.days_late IS 'Number of days past the due date (0 if on time)';
COMMENT ON COLUMN submission.grade IS 'Score given by instructor (0 to max_grade)';
COMMENT ON COLUMN submission.feedback IS 'Instructor comments/feedback';
COMMENT ON COLUMN submission.graded_by IS 'Admin/instructor who graded the submission';

-- ============================================================================
-- End of Migration V19
-- ============================================================================

