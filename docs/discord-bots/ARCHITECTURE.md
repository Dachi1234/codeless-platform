# Discord Multi-Agent Bots - Architecture

**Created**: October 22, 2025  
**Status**: Planning Phase  
**Deployment**: Cloud Run (Standalone Service)

---

## 🎯 Overview

A standalone Discord bot service that hosts multiple AI agents (Laura, Luka, Nino) for student interactions. Completely independent from the main e-learning platform.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Discord Platform                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Laura Bot    │  │ Luka Bot     │  │ Nino Bot     │          │
│  │ @Laura       │  │ @Luka        │  │ @Nino        │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
│                      WebSocket Gateway                           │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              Google Cloud Run (Always-On)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  codeless-discord-bots (Node.js + TypeScript)             │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Discord Client (discord.js)                        │  │  │
│  │  │  - Single WebSocket connection                      │  │  │
│  │  │  - Message router                                   │  │  │
│  │  │  - Event handlers                                   │  │  │
│  │  └─────────────────┬───────────────────────────────────┘  │  │
│  │                    │                                       │  │
│  │                    ↓                                       │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Multi-Agent Router                                 │  │  │
│  │  │  - Route @Laura → Laura Agent                       │  │  │
│  │  │  - Route @Luka → Luka Agent                         │  │  │
│  │  │  - Route @Nino → Nino Agent                         │  │  │
│  │  └────┬────────────────┬────────────────┬──────────────┘  │  │
│  │       │                │                │                  │  │
│  │       ↓                ↓                ↓                  │  │
│  │  ┌─────────┐     ┌─────────┐     ┌─────────┐             │  │
│  │  │ Laura   │     │  Luka   │     │  Nino   │             │  │
│  │  │ Agent   │     │  Agent  │     │  Agent  │             │  │
│  │  └────┬────┘     └────┬────┘     └────┬────┘             │  │
│  │       │               │               │                   │  │
│  │       └───────────────┴───────────────┘                   │  │
│  │                       │                                    │  │
│  │                       ↓                                    │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  OpenAI Agent SDK Runner                            │  │  │
│  │  │  - Execute agent prompts                            │  │  │
│  │  │  - Manage conversation context                      │  │  │
│  │  │  - Handle tool calls (if any)                       │  │  │
│  │  └─────────────────┬───────────────────────────────────┘  │  │
│  │                    │                                       │  │
│  │                    ↓                                       │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Database Layer (PostgreSQL Connection Pool)        │  │  │
│  │  │  - Store conversations                              │  │  │
│  │  │  - Store messages                                   │  │  │
│  │  │  - Track student profiles                           │  │  │
│  │  └─────────────────┬───────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Port: 3000                                                │  │
│  │  Min Instances: 1 (Always-On)                              │  │
│  │  Max Instances: 3                                          │  │
│  │  Memory: 512Mi                                              │  │
│  │  CPU: 1                                                     │  │
│  └────────────────────┼───────────────────────────────────────┘  │
└────────────────────────┼───────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (Separate Database)                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Schema: discord_bots                                     │  │
│  │                                                            │  │
│  │  Tables:                                                   │  │
│  │  - conversations (Discord channels/DMs)                   │  │
│  │  - messages (Full chat history)                           │  │
│  │  - student_profiles (Discord user metadata)               │  │
│  │  - agent_configs (Agent settings per server)              │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAI API                                    │
│  - Agent execution                                               │
│  - Conversation management                                       │
│  - Response generation                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Separation of Concerns

### ✅ NO Integration With:
- ❌ Frontend (Angular/Vercel) - Completely separate
- ❌ Backend (Spring Boot) - No API calls
- ❌ Main Platform Database - Separate schema

### ✅ Standalone Components:
- ✅ Own database in Neon
- ✅ Own Cloud Run service
- ✅ Own deployment pipeline
- ✅ Own environment variables
- ✅ Own monitoring/logs

---

## 📊 Database Schema

### Separate Neon Database

**Connection**: New database in Neon (Free tier supports multiple databases)

```sql
-- Database: discord_bots (NEW)
-- Schema: public

-- 1. Conversations (Discord channels or DMs)
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'discord',
  channel_id TEXT NOT NULL UNIQUE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('dm', 'text_channel', 'thread')),
  guild_id TEXT,                    -- NULL for DMs
  channel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_channel ON conversations(channel_id);
CREATE INDEX idx_conversations_guild ON conversations(guild_id);

-- 2. Messages (Full chat history)
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  discord_message_id TEXT NOT NULL UNIQUE,
  sender_id TEXT NOT NULL,          -- Discord user ID or bot ID
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'agent')),
  agent_name TEXT,                  -- 'laura' | 'luka' | 'nino' (if sender_type = 'agent')
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_discord_id ON messages(discord_message_id);

-- 3. Student Profiles (Discord users)
CREATE TABLE student_profiles (
  discord_user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  discriminator TEXT,               -- Discord discriminator (deprecated but keep for now)
  avatar_url TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,  -- Flexible field for custom data
  notes TEXT,                          -- Admin notes about the student
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_last_seen ON student_profiles(last_seen_at DESC);

-- 4. Agent Configs (Per-guild settings)
CREATE TABLE agent_configs (
  id BIGSERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL,
  agent_name TEXT NOT NULL CHECK (agent_name IN ('laura', 'luka', 'nino')),
  enabled BOOLEAN DEFAULT TRUE,
  custom_prompt TEXT,               -- Override default agent prompt
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guild_id, agent_name)
);

-- 5. Conversation Summaries (For context window optimization)
CREATE TABLE conversation_summaries (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  message_count INT NOT NULL,
  from_message_id BIGINT,
  to_message_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_summaries_conversation ON conversation_summaries(conversation_id, created_at DESC);
```

---

## 🤖 Agent Architecture

### Agent Personas

#### Laura (VP Product Strategy)
- **Role**: Demanding stakeholder
- **Tone**: Business-first, impatient, results-driven
- **Use Cases**: 
  - Project management pressure
  - Deadline enforcement
  - Business value discussions

#### Luka (Technical Lead)
- **Role**: Senior developer mentor
- **Tone**: Technical, helpful, patient
- **Use Cases**: 
  - Code reviews
  - Architecture discussions
  - Technical problem-solving

#### Nino (QA Lead)
- **Role**: Quality assurance expert
- **Tone**: Detail-oriented, thorough, quality-focused
- **Use Cases**: 
  - Testing discussions
  - Bug reporting
  - Quality standards

### Agent Routing Logic

```typescript
// When message arrives
if (message.mentions.users.has(LAURA_BOT_ID)) {
  agent = 'laura';
} else if (message.mentions.users.has(LUKA_BOT_ID)) {
  agent = 'luka';
} else if (message.mentions.users.has(NINO_BOT_ID)) {
  agent = 'nino';
} else if (message.channel.isDMBased()) {
  // In DMs, route to default agent (Laura)
  agent = 'laura';
} else {
  // Not mentioned, ignore
  return;
}
```

---

## 🔐 Security

### Environment Variables

```bash
# Discord
DISCORD_LAURA_TOKEN=...
DISCORD_LUKA_TOKEN=...
DISCORD_NINO_TOKEN=...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...  (optional)

# Database
DATABASE_URL=postgresql://user:pass@neon.tech:5432/discord_bots

# App Config
NODE_ENV=production
LOG_LEVEL=info
MAX_CONTEXT_MESSAGES=15
```

### Security Measures

1. ✅ **No secrets in code** - All in environment variables
2. ✅ **Separate database** - No access to main platform data
3. ✅ **Rate limiting** - Prevent spam/abuse
4. ✅ **Message content validation** - Sanitize inputs
5. ✅ **Error handling** - Don't leak internal errors to Discord

---

## 📦 Technology Stack

### Runtime & Language
- **Node.js**: 20.x LTS
- **TypeScript**: 5.x
- **Package Manager**: npm

### Key Dependencies
```json
{
  "dependencies": {
    "discord.js": "^14.14.0",
    "openai": "^4.x",
    "pg": "^8.11.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "@types/node": "^20.10.0",
    "@types/pg": "^8.10.0"
  }
}
```

### Infrastructure
- **Deployment**: Google Cloud Run
- **Database**: Neon PostgreSQL (Free tier)
- **Container**: Docker
- **CI/CD**: Cloud Build (same as backend)

---

## 🚀 Deployment Strategy

### Cloud Run Configuration

```yaml
# Service: codeless-discord-bots
Region: europe-west1
Memory: 512Mi
CPU: 1
Min Instances: 1 (Always-on for WebSocket)
Max Instances: 3
Timeout: 3600s (1 hour - long-running connections)
Concurrency: 1 (Single instance handles all Discord connections)
Port: 3000
```

### Why Always-On?

Discord bot **REQUIRES** persistent WebSocket connection:
- ❌ Can't scale to zero (would disconnect from Discord)
- ❌ Cold starts would miss messages
- ✅ Min instance = 1 ensures always connected

### Cost Estimation

```
Cloud Run Always-On Instance:
- Memory: 512Mi
- CPU: 1
- Region: europe-west1
- Min instances: 1

Estimated cost: ~$10-15/month
(Based on Google Cloud Run pricing)
```

---

## 📁 Project Structure

```
discord-bots/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── Dockerfile
├── cloudbuild.yaml
├── README.md
│
├── sql/
│   ├── 001_init.sql
│   └── 002_seed.sql (optional)
│
├── src/
│   ├── index.ts                    # Main entry point
│   │
│   ├── config/
│   │   ├── env.ts                  # Environment variables
│   │   ├── discord.ts              # Discord config
│   │   └── agents.ts               # Agent configurations
│   │
│   ├── database/
│   │   ├── connection.ts           # PostgreSQL pool
│   │   ├── conversations.ts        # Conversation queries
│   │   ├── messages.ts             # Message queries
│   │   └── students.ts             # Student profile queries
│   │
│   ├── discord/
│   │   ├── client.ts               # Discord client setup
│   │   ├── handlers/
│   │   │   ├── message.ts          # Message event handler
│   │   │   ├── ready.ts            # Ready event handler
│   │   │   └── error.ts            # Error event handler
│   │   └── utils/
│   │       ├── permissions.ts      # Permission checks
│   │       └── formatting.ts       # Message formatting
│   │
│   ├── agents/
│   │   ├── base.ts                 # Base agent class
│   │   ├── laura.ts                # Laura agent
│   │   ├── luka.ts                 # Luka agent
│   │   ├── nino.ts                 # Nino agent
│   │   └── router.ts               # Agent routing logic
│   │
│   ├── openai/
│   │   ├── client.ts               # OpenAI client setup
│   │   ├── runner.ts               # Agent SDK runner
│   │   └── context.ts              # Context management
│   │
│   └── utils/
│       ├── logger.ts               # Logging utility
│       ├── rate-limiter.ts         # Rate limiting
│       └── errors.ts               # Error classes
│
└── docs/
    ├── ARCHITECTURE.md             # This file
    ├── IMPLEMENTATION_PLAN.md      # Implementation plan
    ├── DEPLOYMENT.md               # Deployment guide
    └── AGENT_PROMPTS.md            # Agent prompt documentation
```

---

## 🔄 Message Flow

### Typical Interaction Flow

```
1. Student sends message: "@Laura I need help with my project"
   ↓
2. Discord Gateway → WebSocket → discord-bots service
   ↓
3. Message Handler receives event
   ↓
4. Router identifies agent: @Laura → Laura Agent
   ↓
5. Load conversation history from database (last 15 messages)
   ↓
6. OpenAI Agent SDK executes Laura's agent with context
   ↓
7. Agent generates response
   ↓
8. Response sent back to Discord
   ↓
9. Save message to database (both student & agent messages)
   ↓
10. Update student profile (last_seen_at, message_count++)
```

---

## 📊 Monitoring & Observability

### Logging

**Structured Logging Format**:
```json
{
  "timestamp": "2025-10-22T10:30:00Z",
  "level": "info",
  "service": "discord-bots",
  "agent": "laura",
  "event": "message_processed",
  "conversation_id": "123",
  "user_id": "discord_user_456",
  "duration_ms": 1250
}
```

### Metrics to Track

1. **Message Volume**
   - Messages per agent
   - Messages per hour/day
   - Average response time

2. **Agent Performance**
   - OpenAI API latency
   - Context window size
   - Token usage per agent

3. **Errors**
   - Discord connection errors
   - OpenAI API errors
   - Database errors

4. **User Engagement**
   - Active users per day
   - Average messages per conversation
   - Most active channels

---

## 🔧 Configuration Management

### Agent Configuration

Agents can be configured per Discord server (guild):

```typescript
// Example: Custom Laura prompt for a specific server
await db.setAgentConfig({
  guild_id: '123456789',
  agent_name: 'laura',
  custom_prompt: 'You are Laura, but in this server focus on web development topics.',
  settings: {
    max_response_length: 500,
    temperature: 0.7,
    enable_tools: true
  }
});
```

---

## 🚧 Limitations & Constraints

### Discord API Limits
- **Message Length**: 2000 characters max
- **Rate Limits**: 
  - 5 messages per 5 seconds per channel
  - 50 requests per second globally
- **WebSocket**: Must handle reconnections

### OpenAI API Limits
- **Rate Limits**: Based on your tier
- **Context Window**: Limited by model (e.g., 128k for GPT-4)
- **Token Costs**: Monitor usage per agent

### Database
- **Neon Free Tier**: 
  - 10 GB storage
  - 1 GB data transfer
  - Good for ~1M messages

---

## 🎯 Success Criteria

### Phase 1 (MVP)
- ✅ One agent (Laura) working
- ✅ Basic conversation in DMs
- ✅ Messages stored in database
- ✅ Deployed to Cloud Run

### Phase 2 (Multi-Agent)
- ✅ All 3 agents working
- ✅ Agent routing by mentions
- ✅ Conversation context maintained
- ✅ Multiple Discord servers supported

### Phase 3 (Advanced)
- ✅ Custom agent configs per server
- ✅ Conversation summaries
- ✅ Student profiles
- ✅ Rate limiting
- ✅ Monitoring dashboard

---

## 📚 References

- [Discord.js Documentation](https://discord.js.org/)
- [OpenAI Agent SDK Documentation](https://platform.openai.com/docs/agents)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)

---

**Document Status**: ✅ Complete  
**Next Step**: Create Implementation Plan  
**Owner**: Development Team

