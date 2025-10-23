# Discord Multi-Agent Bots - Final Architecture

**Created**: October 22, 2025  
**Status**: Final Implementation Plan  
**Agent Platform**: n8n Cloud  
**Database**: Shared Neon (existing database)

---

## 🎯 Your Requirements

1. ✅ **n8n Cloud** - You have this
2. ✅ **Same Neon Database** - Reuse existing, add schema
3. ✅ **One Bot for Testing** - Start with Laura
4. ✅ **Agent Routing in Discord Bot** - Not in n8n

---

## 🏗️ Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Discord Platform                          │
│                                                              │
│  For Testing: One Bot (Laura)                               │
│  Later: Multiple Bots (Laura, Luka, Nino)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket
                         ↓
┌─────────────────────────────────────────────────────────────┐
│         Google Cloud Run (Discord Bot Service)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  codeless-discord-bots                                │  │
│  │                                                        │  │
│  │  RESPONSIBILITIES:                                    │  │
│  │  1. Listen to Discord                                 │  │
│  │  2. Determine which agent to use                      │  │
│  │  3. Route to correct n8n workflow                     │  │
│  │  4. Receive responses from n8n                        │  │
│  │  5. Send back to Discord                              │  │
│  │  6. Store in database                                 │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Discord Client                                 │  │  │
│  │  │  - Single bot (Laura for testing)              │  │  │
│  │  │  - Later: Multiple bots                         │  │  │
│  │  └──────────────────┬──────────────────────────────┘  │  │
│  │                     │                                  │  │
│  │                     ↓                                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Agent Router (YOUR LOGIC)                      │  │  │
│  │  │  if (@Laura) → laura_webhook                    │  │  │
│  │  │  if (@Luka) → luka_webhook                      │  │  │
│  │  │  if (@Nino) → nino_webhook                      │  │  │
│  │  └──────────┬──────────────────────────────────────┘  │  │
│  │             │                                          │  │
│  │             │  Sends to different n8n webhooks        │  │
│  │             ├────────────┬──────────────┬─────────────┤  │
│  │             ↓            ↓              ↓             │  │
│  │    laura_webhook  luka_webhook   nino_webhook        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    n8n Cloud (3 Separate Workflows)          │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐  │
│  │ Laura Workflow   │  │ Luka Workflow    │  │  Nino    │  │
│  │                  │  │                  │  │ Workflow │  │
│  │ Webhook URL:     │  │ Webhook URL:     │  │          │  │
│  │ /laura           │  │ /luka            │  │ /nino    │  │
│  │                  │  │                  │  │          │  │
│  │ 1. Receive msg   │  │ 1. Receive msg   │  │ Same...  │  │
│  │ 2. Call OpenAI   │  │ 2. Call OpenAI   │  │          │  │
│  │ 3. Send back     │  │ 3. Send back     │  │          │  │
│  └──────────────────┘  └──────────────────┘  └──────────┘  │
│                                                              │
│  Each workflow is SIMPLE:                                   │
│  - No agent routing (Discord bot does that)                │
│  - Just execute their specific agent                       │
│  - Return response                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│         Neon PostgreSQL (SHARED - Your Existing DB)         │
│                                                              │
│  Database: codeless_db (your existing database)             │
│                                                              │
│  New Schema: discord_bots                                   │
│  ├─ discord_bots.conversations                              │
│  ├─ discord_bots.messages                                   │
│  └─ discord_bots.student_profiles                           │
│                                                              │
│  Existing Tables: (untouched)                               │
│  ├─ public.users                                            │
│  ├─ public.course                                           │
│  └─ ... (all your platform tables)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Flow (Updated)

### Example: Student messages Laura

```
1. Student in Discord:
   "@Laura help with my deadline"
   ↓

2. Discord Bot (Cloud Run):
   - Receives message
   - Detects: @Laura mentioned
   - Loads conversation history from DB
   - Routes to Laura's specific n8n webhook
   
   POST https://n8n.cloud/webhook/laura-agent
   {
     "user": {...},
     "message": "help with my deadline",
     "conversation_history": [...]
   }
   ↓

3. n8n: Laura Workflow (Simple!)
   - Receives webhook
   - Executes Laura's OpenAI agent
   - No routing logic needed (already routed)
   - Returns response
   
   POST https://discord-bot-url/webhook/n8n-response
   {
     "channel_id": "...",
     "response": "Let's align on priorities..."
   }
   ↓

4. Discord Bot:
   - Receives response
   - Sends to Discord
   - Saves to database (discord_bots.messages)
   ↓

5. Student sees response
```

---

## 📊 Database Strategy (Shared Neon)

### Option A: Separate Schema (RECOMMENDED)

**Use PostgreSQL schemas to isolate discord bot data:**

```sql
-- Create separate schema
CREATE SCHEMA IF NOT EXISTS discord_bots;

-- Set search path
SET search_path TO discord_bots, public;

-- Create tables in discord_bots schema
CREATE TABLE discord_bots.conversations (
  id BIGSERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  channel_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discord_bots.messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES discord_bots.conversations(id),
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  agent_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discord_bots.student_profiles (
  discord_user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Benefits**:
- ✅ Clean separation from platform tables
- ✅ Same database (n8n can connect with PG integration)
- ✅ Easy to manage permissions
- ✅ No cross-contamination

**n8n PostgreSQL Node Configuration**:
```
Host: ep-xxx.neon.tech
Database: codeless_db
Schema: discord_bots  (important!)
User: your_user
Password: your_password
SSL: true
```

---

### Option B: Table Prefix (Alternative)

```sql
-- Add prefix to all discord bot tables
CREATE TABLE discord_conversations (...);
CREATE TABLE discord_messages (...);
CREATE TABLE discord_student_profiles (...);
```

**Less clean, but works if you prefer.**

---

## 🎯 Agent Routing Logic (Discord Bot)

### For Testing (One Bot)

```typescript
// src/discord/handlers/message.ts

export async function handleMessage(message: Message) {
  if (message.author.bot) return;
  
  // For testing: Laura responds to everything
  const agent = 'laura';
  const webhookUrl = process.env.N8N_LAURA_WEBHOOK_URL;
  
  await sendToN8n(message, agent, webhookUrl);
}
```

### For Production (Multiple Bots)

```typescript
// src/discord/handlers/message.ts

const AGENT_BOTS = {
  [process.env.DISCORD_LAURA_ID!]: {
    name: 'laura',
    webhook: process.env.N8N_LAURA_WEBHOOK_URL
  },
  [process.env.DISCORD_LUKA_ID!]: {
    name: 'luka', 
    webhook: process.env.N8N_LUKA_WEBHOOK_URL
  },
  [process.env.DISCORD_NINO_ID!]: {
    name: 'nino',
    webhook: process.env.N8N_NINO_WEBHOOK_URL
  }
};

export async function handleMessage(message: Message) {
  if (message.author.bot) return;
  
  // Determine which agent
  let agent = null;
  
  if (message.channel.isDMBased()) {
    // DMs: Use the bot that received the DM
    agent = AGENT_BOTS[client.user!.id];
  } else {
    // Channels: Check mentions
    for (const [botId, agentInfo] of Object.entries(AGENT_BOTS)) {
      if (message.mentions.users.has(botId)) {
        agent = agentInfo;
        break;
      }
    }
  }
  
  if (!agent) return; // Not mentioned
  
  // Send to specific agent's n8n workflow
  await sendToN8n(message, agent.name, agent.webhook);
}
```

---

## 🔐 Environment Variables

### Discord Bot (Cloud Run)

```bash
# Discord Bot (For Testing - One Bot)
DISCORD_LAURA_TOKEN=your_laura_bot_token

# Later - Multiple Bots
DISCORD_LAURA_ID=123456789...
DISCORD_LUKA_ID=987654321...
DISCORD_NINO_ID=456789123...
DISCORD_LUKA_TOKEN=...
DISCORD_NINO_TOKEN=...

# n8n Webhooks (Separate URL per agent)
N8N_LAURA_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/laura-agent
N8N_LUKA_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/luka-agent
N8N_NINO_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/nino-agent
N8N_WEBHOOK_SECRET=<strong-secret>

# Database (SHARED)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech:5432/codeless_db?sslmode=require

# App
NODE_ENV=production
PORT=3000
DISCORD_BOT_URL=https://your-cloud-run-url.run.app
```

### n8n (No env vars needed!)

n8n workflows just need:
- OpenAI credentials (configured in n8n UI)
- Discord bot callback URL (hardcoded in workflow)

---

## 📦 Simplified n8n Workflows

### Each Workflow is SIMPLE (No Routing!)

**Laura Workflow**:
```
[Webhook Trigger] /webhook/laura-agent
  ↓
[OpenAI Agent Node]
  System: "You are Laura (VP Product)..."
  Context: {{ $json.conversation_history }}
  Message: {{ $json.message }}
  ↓
[HTTP Request] POST to Discord Bot
  URL: https://discord-bot-url/webhook/n8n-response
  Body: {
    channel_id: {{ $json.channel_id }},
    response: {{ $node["OpenAI"].json.response }}
  }
```

**Luka Workflow**: Same structure, different prompt  
**Nino Workflow**: Same structure, different prompt

**No complex routing in n8n!** Discord bot handles that.

---

## 🚀 Implementation Plan (Simplified)

### Phase 1: One Bot Testing (Day 1)

**Setup**:
1. Create ONE Discord bot (Laura)
2. Set up Discord bot service (Cloud Run)
3. Add discord_bots schema to Neon
4. Create ONE n8n workflow (Laura)
5. Test end-to-end

**Testing**:
- DM to Laura → She responds
- @Laura in channel → She responds

### Phase 2: Add More Bots (Day 2)

**Setup**:
1. Create 2 more Discord bots (Luka, Nino)
2. Add routing logic to Discord bot
3. Create 2 more n8n workflows
4. Test all 3 agents

**Testing**:
- @Laura → Laura responds
- @Luka → Luka responds
- @Nino → Nino responds

---

## 📊 Database Setup (Shared Neon)

### SQL Script for Shared Database

```sql
-- File: sql/001_discord_schema.sql

-- Create separate schema for Discord bots
CREATE SCHEMA IF NOT EXISTS discord_bots;

-- Grant permissions (adjust user name)
GRANT USAGE ON SCHEMA discord_bots TO your_neon_user;
GRANT ALL PRIVILEGES ON SCHEMA discord_bots TO your_neon_user;

-- Set search path for session
SET search_path TO discord_bots;

-- Conversations
CREATE TABLE discord_bots.conversations (
  id BIGSERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('dm', 'text', 'thread')),
  guild_id TEXT,
  channel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE discord_bots.messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES discord_bots.conversations(id) ON DELETE CASCADE,
  discord_message_id TEXT NOT NULL UNIQUE,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'agent')),
  agent_name TEXT CHECK (agent_name IN ('laura', 'luka', 'nino')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Profiles
CREATE TABLE discord_bots.student_profiles (
  discord_user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INT DEFAULT 0
);

-- Indexes
CREATE INDEX idx_messages_conversation ON discord_bots.messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversations_channel ON discord_bots.conversations(channel_id);

-- Grant permissions on tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA discord_bots TO your_neon_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA discord_bots TO your_neon_user;
```

**Apply**:
```bash
psql "$DATABASE_URL" -f sql/001_discord_schema.sql
```

---

## 🔧 n8n PostgreSQL Integration

### Configure in n8n (If Needed)

n8n Cloud has PostgreSQL integration for queries:

**Credentials**:
```
Host: ep-xxx.neon.tech
Port: 5432
Database: codeless_db
User: your_user
Password: your_password
SSL Mode: require
```

**Use Cases**:
- Load recent messages for context
- Track conversation stats
- Query student profiles

**Example n8n Node**:
```
[PostgreSQL Node]
  Operation: Execute Query
  Query: 
    SELECT content, sender_type 
    FROM discord_bots.messages 
    WHERE conversation_id = {{ $json.conversation_id }}
    ORDER BY created_at DESC 
    LIMIT 15
```

**But actually**, your Discord bot will send conversation history in the webhook, so n8n doesn't need to query the database!

---

## ⏱️ Timeline (Updated)

```
Day 1: One Bot Setup (6 hours)
├─ Create Discord bot (Laura)
├─ Set up Cloud Run service
├─ Add discord_bots schema to Neon
├─ Create Laura n8n workflow
└─ Test end-to-end

Day 2: Expand to Multiple Bots (4 hours) - LATER
├─ Create Luka & Nino bots
├─ Add routing logic
├─ Create Luka & Nino workflows
└─ Test all 3

Total: 1-2 days for testing, expandable later
```

---

## 💰 Cost (Updated)

```
Development: 1 day for testing setup

Monthly Running:
├─ Cloud Run: $10-15 (always-on)
├─ Neon Database: $0 (shared, already paying)
├─ n8n Cloud: $20 (you already have)
└─ OpenAI API: $20-50

Total: $50-85/month (n8n + Cloud Run + OpenAI)
```

---

## ✅ Advantages of This Setup

### 1. **Reuse Existing Database** ✅
- No separate Neon instance needed
- Schema isolation keeps it clean
- n8n PG integration works

### 2. **Agent Routing in Discord Bot** ✅
- More control over routing logic
- Easier to add conditional logic
- n8n workflows stay simple

### 3. **Simple n8n Workflows** ✅
- Each workflow is agent-specific
- No complex routing in n8n
- Easy to modify per-agent

### 4. **Start with One Bot** ✅
- Test with Laura first
- Add more bots later
- No upfront complexity

---

## 🎯 First Steps

### Step 1: Create Discord Bot (30 min)
1. Go to https://discord.com/developers/applications
2. Create "Laura Bot"
3. Enable Message Content Intent
4. Get bot token
5. Invite to test server

### Step 2: Add Schema to Neon (10 min)
```sql
-- Run this on your existing Neon database
CREATE SCHEMA discord_bots;
-- Then run the table creation script
```

### Step 3: Create n8n Workflow (30 min)
1. Create workflow: "Discord - Laura Agent"
2. Add webhook trigger: `/webhook/laura-agent`
3. Add OpenAI node with Laura's prompt
4. Add HTTP Request to callback
5. Activate workflow

### Step 4: Build Discord Bot (4-5 hours)
- Initialize project
- Set up Discord client
- Set up Express server
- Implement webhook sender/receiver
- Test end-to-end

---

## 📋 Quick Checklist

**Before Starting**:
- [ ] n8n Cloud account (you have)
- [ ] Access to existing Neon database
- [ ] One Discord bot created (Laura)
- [ ] OpenAI API key

**Day 1**:
- [ ] Project initialized
- [ ] discord_bots schema created
- [ ] Discord bot connects
- [ ] Sends webhook to n8n
- [ ] Receives webhook from n8n
- [ ] End-to-end test works

**Later (Day 2+)**:
- [ ] Add Luka & Nino bots
- [ ] Update routing logic
- [ ] Create additional workflows

---

## 🚀 Ready to Start?

**First Command**:
```bash
cd C:\Users\Ryzen\Desktop\Codeless_Web
mkdir discord-bots
cd discord-bots
npm init -y
```

**What would you like to do?**
1. Start with Discord bot setup
2. First create Discord schema in Neon
3. First set up n8n workflow
4. Ask more questions

Let me know and I'll guide you step-by-step! 🎯

---

**Document Status**: ✅ Final Architecture  
**Timeline**: 1 day for testing, expandable  
**Next Step**: Your choice - where to start?

