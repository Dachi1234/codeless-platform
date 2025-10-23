-- ============================================
-- Discord Bots Schema Setup
-- ============================================
-- Run this on your EXISTING Neon database
-- This creates a separate schema to isolate Discord bot data

-- Create separate schema for Discord bots
CREATE SCHEMA IF NOT EXISTS discord_bots;

-- Set search path for this session
SET search_path TO discord_bots, public;

-- ============================================
-- Table: conversations
-- ============================================
-- Stores Discord channels/DMs as conversations
CREATE TABLE discord_bots.conversations (
  id BIGSERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('dm', 'text', 'thread')),
  guild_id TEXT,                    -- NULL for DMs
  channel_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_channel ON discord_bots.conversations(channel_id);
CREATE INDEX idx_conversations_guild ON discord_bots.conversations(guild_id) WHERE guild_id IS NOT NULL;
CREATE INDEX idx_conversations_activity ON discord_bots.conversations(last_activity DESC);

-- ============================================
-- Table: messages
-- ============================================
-- Stores all messages (students and agents)
CREATE TABLE discord_bots.messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES discord_bots.conversations(id) ON DELETE CASCADE,
  discord_message_id TEXT NOT NULL UNIQUE,
  sender_id TEXT NOT NULL,          -- Discord user ID or bot ID
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'agent')),
  agent_name TEXT CHECK (agent_name IN ('laura', 'luka', 'nino') OR agent_name IS NULL),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON discord_bots.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON discord_bots.messages(sender_id);
CREATE INDEX idx_messages_discord_id ON discord_bots.messages(discord_message_id);
CREATE INDEX idx_messages_agent ON discord_bots.messages(agent_name) WHERE agent_name IS NOT NULL;

-- ============================================
-- Table: student_profiles
-- ============================================
-- Tracks Discord users who interact with bots
CREATE TABLE discord_bots.student_profiles (
  discord_user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_student_last_seen ON discord_bots.student_profiles(last_seen_at DESC);
CREATE INDEX idx_student_message_count ON discord_bots.student_profiles(message_count DESC);

-- ============================================
-- Verification
-- ============================================
-- Check that everything was created
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname = 'discord_bots'
ORDER BY tablename;

-- Show table details
\dt discord_bots.*;

