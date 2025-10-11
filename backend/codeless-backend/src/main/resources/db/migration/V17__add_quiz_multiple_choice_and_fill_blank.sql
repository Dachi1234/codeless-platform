-- Add support for multiple correct answers in MULTIPLE_CHOICE
-- Add support for fill-in-the-blank with acceptable answers

-- Add acceptable_answers column to quiz_answer_options (for FILL_BLANK)
ALTER TABLE quiz_answer_options
ADD COLUMN IF NOT EXISTS acceptable_answers TEXT;

-- Add selected_option_ids column to quiz_user_answers (for MULTIPLE_CHOICE)
ALTER TABLE quiz_user_answers
ADD COLUMN IF NOT EXISTS selected_option_ids TEXT;

-- Add comments for clarity
COMMENT ON COLUMN quiz_answer_options.acceptable_answers IS 'Comma-separated acceptable answers for FILL_BLANK questions. Example: Paris,paris,PARIS';
COMMENT ON COLUMN quiz_user_answers.selected_option_ids IS 'Comma-separated option IDs for MULTIPLE_CHOICE questions. Example: 1,3,5';

