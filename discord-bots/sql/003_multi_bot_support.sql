-- Migration: Multi-Bot Support
-- Adds support for multiple bots (Laura, Giorgi, Nino, etc.)

-- Add bot_name to conversations table
ALTER TABLE discord_bots.conversations
ADD COLUMN IF NOT EXISTS bot_name TEXT DEFAULT 'laura';

-- Add bot_name to messages table
ALTER TABLE discord_bots.messages
ADD COLUMN IF NOT EXISTS bot_name TEXT DEFAULT 'laura';

-- Backfill existing messages with bot_name from agent_name
UPDATE discord_bots.messages 
SET bot_name = agent_name 
WHERE agent_name IS NOT NULL AND bot_name = 'laura';

-- Add bot-specific profile fields for Giorgi (technical mentor)
ALTER TABLE discord_bots.student_profiles
ADD COLUMN IF NOT EXISTS tech_respect INTEGER, -- Technical respect level (1-10)
ADD COLUMN IF NOT EXISTS code_quality INTEGER, -- Code quality assessment (1-10)
ADD COLUMN IF NOT EXISTS current_stack TEXT,   -- Current technology stack
ADD COLUMN IF NOT EXISTS blocker TEXT,         -- Current technical blocker
ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'general'; -- 'developer', 'designer', 'pm', etc.

-- Add bot-specific profile fields for Nino (design mentor) - for future use
ALTER TABLE discord_bots.student_profiles
ADD COLUMN IF NOT EXISTS design_taste INTEGER,     -- Design taste level (1-10)
ADD COLUMN IF NOT EXISTS ux_understanding INTEGER, -- UX understanding (1-10)
ADD COLUMN IF NOT EXISTS current_mockup TEXT,      -- Current design project
ADD COLUMN IF NOT EXISTS feedback_notes TEXT;      -- Design feedback notes

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_bot_name 
ON discord_bots.conversations(bot_name);

CREATE INDEX IF NOT EXISTS idx_messages_bot_name 
ON discord_bots.messages(bot_name);

CREATE INDEX IF NOT EXISTS idx_student_profiles_type 
ON discord_bots.student_profiles(student_type);

-- Create composite index for conversation lookup by channel and bot
CREATE INDEX IF NOT EXISTS idx_conversations_channel_bot 
ON discord_bots.conversations(channel_id, bot_name);

COMMENT ON COLUMN discord_bots.conversations.bot_name IS 'Name of the bot handling this conversation (laura, giorgi, nino, etc.)';
COMMENT ON COLUMN discord_bots.messages.bot_name IS 'Name of the bot that sent/received this message';
COMMENT ON COLUMN discord_bots.student_profiles.tech_respect IS 'Technical respect level for Giorgi (1-10)';
COMMENT ON COLUMN discord_bots.student_profiles.code_quality IS 'Code quality assessment for Giorgi (1-10)';
COMMENT ON COLUMN discord_bots.student_profiles.student_type IS 'Type of student: developer, designer, pm, etc.';

