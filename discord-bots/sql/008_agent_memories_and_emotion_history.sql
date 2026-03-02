-- ============================================================================
-- Migration 008: Agent Memories & Emotion History
-- ============================================================================
-- Purpose: Give agents episodic memory and emotional trajectory tracking.
--   - agent_memories: replaces the single "notes" TEXT field with structured,
--     searchable memory entries (facts, promises, observations, etc.)
--   - emotion_history: tracks how tension/trust/respect change over time,
--     so agents can reference emotional arcs ("you were rude last week but
--     you've been chill lately")
-- ============================================================================

-- =============================================================================
-- 1. Agent Memories — Episodic Memory System
-- =============================================================================
-- Each agent stores individual memory entries per student.
-- These replace the single `notes` TEXT field on laura_profiles/giorgi_profiles.
-- Memory types:
--   fact        — "student's name is Dachi", "they work at a startup"
--   observation — "student seems stressed today", "they're getting better at specs"
--   promise     — "I told them I'd have it done by Friday"
--   preference  — "student hates long messages", "prefers dark mode"
--   milestone   — "first successful deployment", "completed 3 projects"
--   frustration — "student got mad when build failed twice"
--   context     — "student is building an e-commerce app for class project"

CREATE TABLE discord_bots.agent_memories (
  id SERIAL PRIMARY KEY,
  discord_user_id VARCHAR(255) NOT NULL
    REFERENCES discord_bots.student_profiles(discord_user_id) ON DELETE CASCADE,
  agent_name VARCHAR(50) NOT NULL
    CHECK (agent_name IN ('laura', 'giorgi', 'luka', 'nino', 'maia')),

  -- Memory content
  memory_type VARCHAR(50) NOT NULL
    CHECK (memory_type IN ('fact', 'observation', 'promise', 'preference', 'milestone', 'frustration', 'context')),
  content TEXT NOT NULL,

  -- Importance: 1-10 (10 = never forget, 1 = minor detail)
  -- AI decides importance. High importance = always included in context.
  importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),

  -- Optional: what triggered this memory (the student message or event)
  trigger_message TEXT,

  -- Soft delete — memories can be "forgotten" without losing data
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast memory retrieval
-- Primary query: "get all active memories for this student from this agent, ordered by importance"
CREATE INDEX idx_memories_user_agent_active
  ON discord_bots.agent_memories(discord_user_id, agent_name, is_active, importance DESC);

-- For finding recent memories
CREATE INDEX idx_memories_created
  ON discord_bots.agent_memories(created_at DESC);

-- For filtering by type (e.g., "get all promises giorgi made")
CREATE INDEX idx_memories_type
  ON discord_bots.agent_memories(agent_name, memory_type, is_active);


-- =============================================================================
-- 2. Emotion History — Emotional Trajectory Tracking
-- =============================================================================
-- Every time an agent's emotional state changes, we log a snapshot.
-- This lets agents say things like "you've been way more respectful lately"
-- or "every time you ask about the deadline, tension goes up"

CREATE TABLE discord_bots.emotion_history (
  id SERIAL PRIMARY KEY,
  discord_user_id VARCHAR(255) NOT NULL
    REFERENCES discord_bots.student_profiles(discord_user_id) ON DELETE CASCADE,
  agent_name VARCHAR(50) NOT NULL
    CHECK (agent_name IN ('laura', 'giorgi', 'luka', 'nino', 'maia')),

  -- Emotional snapshot (same fields as agent profiles)
  tension_level INTEGER CHECK (tension_level BETWEEN 1 AND 10),
  trust_level INTEGER CHECK (trust_level BETWEEN 1 AND 10),
  tech_respect INTEGER CHECK (tech_respect BETWEEN 1 AND 10),  -- Giorgi only, NULL for others

  -- What caused this emotional shift
  trigger TEXT,  -- e.g., "student was rude about deadline", "successful deployment"

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Primary query: "get emotion timeline for this student+agent"
CREATE INDEX idx_emotion_user_agent_time
  ON discord_bots.emotion_history(discord_user_id, agent_name, created_at DESC);

-- For analytics: "find all high-tension moments"
CREATE INDEX idx_emotion_tension
  ON discord_bots.emotion_history(agent_name, tension_level, created_at DESC);


-- =============================================================================
-- 3. Enhance student_profiles with aggregated stats
-- =============================================================================

-- Communication style observed across all agents
ALTER TABLE discord_bots.student_profiles
  ADD COLUMN IF NOT EXISTS communication_style VARCHAR(50);
-- e.g., 'formal', 'casual', 'aggressive', 'passive', 'technical'

-- Technical proficiency as observed by agents
ALTER TABLE discord_bots.student_profiles
  ADD COLUMN IF NOT EXISTS technical_level VARCHAR(50);
-- e.g., 'beginner', 'intermediate', 'advanced'

-- Deployment counters (fast lookups without counting deployments table)
ALTER TABLE discord_bots.student_profiles
  ADD COLUMN IF NOT EXISTS total_deployments INTEGER DEFAULT 0;

ALTER TABLE discord_bots.student_profiles
  ADD COLUMN IF NOT EXISTS successful_deployments INTEGER DEFAULT 0;


-- =============================================================================
-- 4. Auto-update timestamps trigger for agent_memories
-- =============================================================================

CREATE TRIGGER agent_memories_update_timestamp
  BEFORE UPDATE ON discord_bots.agent_memories
  FOR EACH ROW
  EXECUTE FUNCTION discord_bots.update_agent_profile_timestamp();
  -- Reuses the trigger function from migration 005


-- =============================================================================
-- 5. Comments for documentation
-- =============================================================================

COMMENT ON TABLE discord_bots.agent_memories IS 'Episodic memory system — each agent stores structured memories per student';
COMMENT ON COLUMN discord_bots.agent_memories.memory_type IS 'fact, observation, promise, preference, milestone, frustration, context';
COMMENT ON COLUMN discord_bots.agent_memories.importance IS '1-10 scale. 8+ always included in AI context. 5+ included when relevant. <5 only for deep recall.';
COMMENT ON COLUMN discord_bots.agent_memories.is_active IS 'Soft delete. FALSE = forgotten/superseded. Can be revived.';

COMMENT ON TABLE discord_bots.emotion_history IS 'Emotional state snapshots over time — tracks how agent feelings change per student';
COMMENT ON COLUMN discord_bots.emotion_history.trigger IS 'What caused the emotional shift (student message summary or event)';

COMMENT ON COLUMN discord_bots.student_profiles.communication_style IS 'Observed communication pattern: formal, casual, aggressive, passive, technical';
COMMENT ON COLUMN discord_bots.student_profiles.technical_level IS 'Assessed technical proficiency: beginner, intermediate, advanced';
COMMENT ON COLUMN discord_bots.student_profiles.total_deployments IS 'Counter: total deployment attempts (updated by bot code)';
COMMENT ON COLUMN discord_bots.student_profiles.successful_deployments IS 'Counter: successful deployments only (updated by bot code)';


-- =============================================================================
-- Verification
-- =============================================================================

SELECT 'agent_memories' as table_name, COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'discord_bots' AND table_name = 'agent_memories';

SELECT 'emotion_history' as table_name, COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'discord_bots' AND table_name = 'emotion_history';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'discord_bots'
  AND table_name = 'student_profiles'
  AND column_name IN ('communication_style', 'technical_level', 'total_deployments', 'successful_deployments')
ORDER BY column_name;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Run this on Neon, then update bot code to read/write these tables.
--
-- Next steps:
--   1. Add saveMemory() and getMemories() to database.service.ts
--   2. Add saveEmotionSnapshot() and getEmotionTimeline() to database.service.ts
--   3. Update n8n AI Agent prompt to output memories array
--   4. Update n8n workflow to fetch memories and include in context
--   5. Update n8n workflow to save new memories after AI response
-- ============================================================================
