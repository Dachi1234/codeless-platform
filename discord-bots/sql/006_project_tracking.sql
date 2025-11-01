-- Migration 006: Add project tracking and deployment history
-- Date: 2025-11-01
-- Purpose: Track student projects, Vercel integration, and deployment history

-- =============================================================================
-- 1. Add agent-specific notes
-- =============================================================================

ALTER TABLE discord_bots.laura_profiles 
  ADD COLUMN notes TEXT;

ALTER TABLE discord_bots.giorgi_profiles 
  ADD COLUMN notes TEXT;

-- Rename shared notes to admin_notes
ALTER TABLE discord_bots.student_profiles 
  RENAME COLUMN notes TO admin_notes;

-- =============================================================================
-- 2. Add project tracking to student_profiles
-- =============================================================================

ALTER TABLE discord_bots.student_profiles 
  ADD COLUMN project_description TEXT,
  ADD COLUMN project_status VARCHAR(50) DEFAULT 'not_started';

-- Add check constraint for project status
ALTER TABLE discord_bots.student_profiles 
  ADD CONSTRAINT student_profiles_project_status_check 
  CHECK (project_status IN ('not_started', 'in_progress', 'completed', 'on_hold'));

-- Add index for querying active projects
CREATE INDEX idx_student_profiles_project_status 
  ON discord_bots.student_profiles(project_status, updated_at DESC);

-- =============================================================================
-- 3. Add Vercel/v0 integration fields to giorgi_profiles
-- =============================================================================

ALTER TABLE discord_bots.giorgi_profiles
  ADD COLUMN vercel_project_id VARCHAR(255),
  ADD COLUMN vercel_chat_id VARCHAR(255),
  ADD COLUMN latest_deployment_url TEXT,
  ADD COLUMN deployment_status VARCHAR(50);

-- Add check constraint for deployment status
ALTER TABLE discord_bots.giorgi_profiles 
  ADD CONSTRAINT giorgi_profiles_deployment_status_check 
  CHECK (deployment_status IN ('success', 'failed', 'building', 'not_deployed'));

-- Add indexes for Vercel queries
CREATE INDEX idx_giorgi_profiles_vercel_project 
  ON discord_bots.giorgi_profiles(vercel_project_id);
  
CREATE INDEX idx_giorgi_profiles_deployment_status 
  ON discord_bots.giorgi_profiles(deployment_status);

-- =============================================================================
-- 4. Create deployments table for full deployment history
-- =============================================================================

CREATE TABLE discord_bots.deployments (
  id SERIAL PRIMARY KEY,
  discord_user_id VARCHAR(255) NOT NULL,
  
  -- What was built/changed
  feature_description TEXT,
  user_prompt TEXT,
  
  -- Vercel details
  deployment_id VARCHAR(255),
  deployment_url TEXT NOT NULL,
  vercel_chat_id VARCHAR(255),
  
  -- Status tracking
  status VARCHAR(50) NOT NULL,
  error_message TEXT,
  build_time_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key
  CONSTRAINT deployments_discord_user_id_fkey 
    FOREIGN KEY (discord_user_id) 
    REFERENCES discord_bots.student_profiles(discord_user_id) 
    ON DELETE CASCADE,
    
  -- Constraints
  CONSTRAINT deployments_status_check 
    CHECK (status IN ('success', 'failed'))
);

-- Indexes for deployments
CREATE INDEX idx_deployments_user_created 
  ON discord_bots.deployments(discord_user_id, created_at DESC);
  
CREATE INDEX idx_deployments_status 
  ON discord_bots.deployments(status, created_at DESC);

-- =============================================================================
-- 5. Add comments for documentation
-- =============================================================================

COMMENT ON COLUMN discord_bots.student_profiles.current_project IS 'Name of the student''s current project';
COMMENT ON COLUMN discord_bots.student_profiles.project_description IS 'Detailed description of what the project does';
COMMENT ON COLUMN discord_bots.student_profiles.project_status IS 'Current status: not_started, in_progress, completed, on_hold';
COMMENT ON COLUMN discord_bots.student_profiles.admin_notes IS 'Notes visible to all agents and trainers (renamed from notes)';

COMMENT ON COLUMN discord_bots.laura_profiles.notes IS 'Laura''s private observations about this student';
COMMENT ON COLUMN discord_bots.giorgi_profiles.notes IS 'Giorgi''s private observations about this student';

COMMENT ON COLUMN discord_bots.giorgi_profiles.vercel_project_id IS 'Vercel project ID (created once, persists across iterations)';
COMMENT ON COLUMN discord_bots.giorgi_profiles.vercel_chat_id IS 'v0 chat ID (used to continue conversations)';
COMMENT ON COLUMN discord_bots.giorgi_profiles.latest_deployment_url IS 'URL of the most recent successful deployment';
COMMENT ON COLUMN discord_bots.giorgi_profiles.deployment_status IS 'Status of the latest deployment attempt';

COMMENT ON TABLE discord_bots.deployments IS 'Full history of all deployment attempts for tracking progress and debugging';

-- =============================================================================
-- Verification queries
-- =============================================================================

-- Test that all tables and columns exist
SELECT 
  'student_profiles' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'discord_bots' 
  AND table_name = 'student_profiles'
  AND column_name IN ('current_project', 'project_description', 'project_status', 'admin_notes')
ORDER BY column_name;

SELECT 
  'laura_profiles' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'discord_bots' 
  AND table_name = 'laura_profiles'
  AND column_name = 'notes';

SELECT 
  'giorgi_profiles' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'discord_bots' 
  AND table_name = 'giorgi_profiles'
  AND column_name IN ('notes', 'vercel_project_id', 'vercel_chat_id', 'latest_deployment_url', 'deployment_status')
ORDER BY column_name;

SELECT 
  'deployments' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'discord_bots' 
  AND table_name = 'deployments';

