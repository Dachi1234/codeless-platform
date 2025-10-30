-- ============================================================================
-- Migration 005: Agent-Specific Profile Tables (CORRECTED)
-- ============================================================================
-- Creates dedicated profile tables for each agent (Laura, Giorgi, etc.)
-- NOTE: This is the NUCLEAR option - drops and recreates all tables
-- Use this for fresh start or when no production data exists
-- ============================================================================

-- WARNING: This script drops ALL discord bot data (conversations, messages, profiles)
-- Only run this if you're okay losing all existing data!

-- Step 1: Drop all tables (cascades to foreign keys)
DROP TABLE IF EXISTS discord_bots.messages CASCADE;
DROP TABLE IF EXISTS discord_bots.laura_profiles CASCADE;
DROP TABLE IF EXISTS discord_bots.giorgi_profiles CASCADE;
DROP TABLE IF EXISTS discord_bots.conversations CASCADE;
DROP TABLE IF EXISTS discord_bots.student_profiles CASCADE;

-- Step 2: Recreate student_profiles (shared data)
CREATE TABLE discord_bots.student_profiles (
  discord_user_id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  name VARCHAR(255),
  cohort VARCHAR(100),
  timezone VARCHAR(50),
  current_project TEXT,  -- SHARED by all agents (both Laura and Giorgi need to know)
  notes TEXT,
  deadline_mvp TIMESTAMP,
  first_seen_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create conversations table
CREATE TABLE discord_bots.conversations (
  id SERIAL PRIMARY KEY,
  channel_id VARCHAR(255) NOT NULL,
  channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('dm', 'text', 'thread')),
  guild_id VARCHAR(255),
  channel_name VARCHAR(255),
  bot_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  UNIQUE(channel_id, bot_name)
);

-- Step 4: Create messages table
CREATE TABLE discord_bots.messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES discord_bots.conversations(id) ON DELETE CASCADE,
  discord_message_id VARCHAR(255) UNIQUE NOT NULL,
  discord_user_id VARCHAR(255),
  sender_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('student', 'agent')),
  agent_name VARCHAR(50) CHECK (agent_name IN ('laura', 'giorgi', 'luka', 'nino', 'maia')),
  bot_name VARCHAR(50),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Create Laura's profile table (PM-specific fields)
CREATE TABLE discord_bots.laura_profiles (
  discord_user_id VARCHAR(255) PRIMARY KEY REFERENCES discord_bots.student_profiles(discord_user_id) ON DELETE CASCADE,
  tension_level INTEGER DEFAULT 5 CHECK (tension_level BETWEEN 1 AND 10),
  trust_level INTEGER DEFAULT 5 CHECK (trust_level BETWEEN 1 AND 10),
  message_count INTEGER DEFAULT 0,
  last_milestone TEXT,          -- PM tracks milestones
  blocked BOOLEAN DEFAULT false, -- PM tracks if project is blocked
  priority VARCHAR(50),          -- PM assigns priority (high/medium/low)
  last_interaction TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 6: Create Giorgi's profile table (Dev-specific fields)
CREATE TABLE discord_bots.giorgi_profiles (
  discord_user_id VARCHAR(255) PRIMARY KEY REFERENCES discord_bots.student_profiles(discord_user_id) ON DELETE CASCADE,
  tension_level INTEGER DEFAULT 5 CHECK (tension_level BETWEEN 1 AND 10),
  trust_level INTEGER DEFAULT 5 CHECK (trust_level BETWEEN 1 AND 10),
  message_count INTEGER DEFAULT 0,
  tech_respect INTEGER DEFAULT 5 CHECK (tech_respect BETWEEN 1 AND 10),
  code_quality INTEGER DEFAULT 5 CHECK (code_quality BETWEEN 1 AND 10),
  current_stack TEXT,            -- Dev tracks tech stack (React, Node, etc.)
  blocker TEXT,                  -- Dev tracks technical blockers
  student_type VARCHAR(50),      -- junior/mid/senior
  last_interaction TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 7: Create indexes
CREATE INDEX idx_conversations_channel ON discord_bots.conversations(channel_id);
CREATE INDEX idx_conversations_bot ON discord_bots.conversations(bot_name);
CREATE INDEX idx_messages_conversation ON discord_bots.messages(conversation_id);
CREATE INDEX idx_messages_discord_user ON discord_bots.messages(discord_user_id);
CREATE INDEX idx_messages_bot ON discord_bots.messages(bot_name);
CREATE INDEX idx_messages_created ON discord_bots.messages(created_at DESC);

CREATE INDEX idx_laura_profiles_updated ON discord_bots.laura_profiles(updated_at DESC);
CREATE INDEX idx_laura_profiles_tension ON discord_bots.laura_profiles(tension_level);
CREATE INDEX idx_laura_profiles_priority ON discord_bots.laura_profiles(priority);

CREATE INDEX idx_giorgi_profiles_updated ON discord_bots.giorgi_profiles(updated_at DESC);
CREATE INDEX idx_giorgi_profiles_tech_respect ON discord_bots.giorgi_profiles(tech_respect);
CREATE INDEX idx_giorgi_profiles_student_type ON discord_bots.giorgi_profiles(student_type);

-- Step 8: Create triggers for auto-updating timestamps
CREATE OR REPLACE FUNCTION discord_bots.update_agent_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER laura_profiles_update_timestamp
  BEFORE UPDATE ON discord_bots.laura_profiles
  FOR EACH ROW
  EXECUTE FUNCTION discord_bots.update_agent_profile_timestamp();

CREATE TRIGGER giorgi_profiles_update_timestamp
  BEFORE UPDATE ON discord_bots.giorgi_profiles
  FOR EACH ROW
  EXECUTE FUNCTION discord_bots.update_agent_profile_timestamp();

-- ============================================================================
-- Migration Complete! ✅
-- ============================================================================
-- Verify with:
-- SELECT * FROM discord_bots.student_profiles LIMIT 5;
-- SELECT * FROM discord_bots.laura_profiles LIMIT 5;
-- SELECT * FROM discord_bots.giorgi_profiles LIMIT 5;
-- ============================================================================
