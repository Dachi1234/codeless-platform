-- Migration: Bot-Specific Tension and Trust Levels
-- Allows each bot to track its own perspective of tension and trust

-- Add bot-specific tension/trust columns
ALTER TABLE discord_bots.student_profiles
ADD COLUMN IF NOT EXISTS laura_tension_level INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS laura_trust_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS giorgi_tension_level INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS giorgi_trust_level INTEGER DEFAULT 0;

-- Migrate existing generic data to Laura's columns
UPDATE discord_bots.student_profiles
SET laura_tension_level = COALESCE(tension_level, 2),
    laura_trust_level = COALESCE(trust_level, 0)
WHERE laura_tension_level IS NULL OR laura_trust_level IS NULL;

-- Add check constraints
ALTER TABLE discord_bots.student_profiles
ADD CONSTRAINT IF NOT EXISTS laura_tension_level_check 
CHECK (laura_tension_level BETWEEN 0 AND 10);

ALTER TABLE discord_bots.student_profiles
ADD CONSTRAINT IF NOT EXISTS laura_trust_level_check 
CHECK (laura_trust_level BETWEEN 0 AND 10);

ALTER TABLE discord_bots.student_profiles
ADD CONSTRAINT IF NOT EXISTS giorgi_tension_level_check 
CHECK (giorgi_tension_level BETWEEN 0 AND 10);

ALTER TABLE discord_bots.student_profiles
ADD CONSTRAINT IF NOT EXISTS giorgi_trust_level_check 
CHECK (giorgi_trust_level BETWEEN 0 AND 10);

-- Add comments for clarity
COMMENT ON COLUMN discord_bots.student_profiles.laura_tension_level IS 
  'Laura: PM tension - deadlines, scope creep, project stress (1-10)';

COMMENT ON COLUMN discord_bots.student_profiles.laura_trust_level IS 
  'Laura: Trust in student execution and commitment (0-10)';

COMMENT ON COLUMN discord_bots.student_profiles.giorgi_tension_level IS 
  'Giorgi: Technical tension - code quality, technical debt, blockers (1-10)';

COMMENT ON COLUMN discord_bots.student_profiles.giorgi_trust_level IS 
  'Giorgi: Trust in student technical decisions and skills (0-10)';

-- Migrate existing generic tension/trust values to Laura's specific columns
-- (before dropping the generic columns)
UPDATE discord_bots.student_profiles
SET laura_tension_level = COALESCE(laura_tension_level, tension_level, 2),
    laura_trust_level = COALESCE(laura_trust_level, trust_level, 0)
WHERE laura_tension_level IS NULL OR laura_trust_level IS NULL;

-- Drop the old generic columns (no longer needed - each bot has its own)
ALTER TABLE discord_bots.student_profiles
DROP COLUMN IF EXISTS tension_level;

ALTER TABLE discord_bots.student_profiles
DROP COLUMN IF EXISTS trust_level;

-- Note: All bots now use their own specific columns (laura_*, giorgi_*, etc.)

