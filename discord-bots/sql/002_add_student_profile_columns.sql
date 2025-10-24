-- ============================================
-- Add Student Profile Columns
-- ============================================
-- Adds columns needed for Laura's memory system

SET search_path TO discord_bots, public;

-- Add new columns to student_profiles table
ALTER TABLE discord_bots.student_profiles
ADD COLUMN IF NOT EXISTS cohort TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS tension_level INTEGER DEFAULT 2 CHECK (tension_level >= 0 AND tension_level <= 10),
ADD COLUMN IF NOT EXISTS trust_level INTEGER DEFAULT 0 CHECK (trust_level >= -5 AND trust_level <= 5),
ADD COLUMN IF NOT EXISTS current_project TEXT,
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS deadline_mvp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deadline_sprint1 TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_student_cohort ON discord_bots.student_profiles(cohort) WHERE cohort IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_tension ON discord_bots.student_profiles(tension_level DESC) WHERE tension_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_deadlines ON discord_bots.student_profiles(deadline_mvp) WHERE deadline_mvp IS NOT NULL;

-- Verification
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'discord_bots' 
  AND table_name = 'student_profiles'
ORDER BY ordinal_position;

