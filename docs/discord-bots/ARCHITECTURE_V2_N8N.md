# Discord Multi-Agent Bots with n8n - Architecture v2

**Created**: October 22, 2025  
**Updated**: October 22, 2025  
**Status**: Planning Phase  
**Agent Platform**: n8n (Workflow/Agent Builder)

---

## 🎯 Overview

A **lightweight Discord bot bridge** that connects Discord messages to n8n workflows. n8n handles all agent logic, AI processing, and routing. The Discord bot is just a webhook relay + message storage.

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
│         Google Cloud Run (Lightweight Webhook Bridge)            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  codeless-discord-bots (Node.js + TypeScript)             │  │
│  │                                                            │  │
│  │  SIMPLIFIED RESPONSIBILITIES:                             │  │
│  │  1. Listen to Discord messages                            │  │
│  │  2. Send webhook to n8n                                   │  │
│  │  3. Receive webhook from n8n                              │  │
│  │  4. Send response back to Discord                         │  │
│  │  5. Store messages in database                            │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Discord Client (discord.js)                        │  │  │
│  │  │  - Single WebSocket connection                      │  │  │
│  │  │  - Message event handler                            │  │  │
│  │  └──────────┬──────────────────────────────────────────┘  │  │
│  │             │                                              │  │
│  │             ↓                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Webhook Sender                                     │  │  │
│  │  │  - Format message for n8n                           │  │  │
│  │  │  - POST to n8n webhook URL                          │  │  │
│  │  │  - Include: user, message, agent, context          │  │  │
│  │  └──────────┬──────────────────────────────────────────┘  │  │
│  │             │                                              │  │
│  │             │                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Webhook Receiver (HTTP Endpoint)                   │  │  │
│  │  │  - POST /webhook/n8n-response                       │  │  │
│  │  │  - Receive agent response from n8n                  │  │  │
│  │  │  - Send to Discord                                  │  │  │
│  │  └──────────┬──────────────────────────────────────────┘  │  │
│  │             │                                              │  │
│  │             ↓                                              │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Database Layer (PostgreSQL)                        │  │  │
│  │  │  - Store conversations                              │  │  │
│  │  │  - Store messages                                   │  │  │
│  │  │  - Get conversation history (for n8n context)       │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Port: 3000                                                │  │
│  │  Endpoints:                                                │  │
│  │  - POST /webhook/n8n-response (receive from n8n)          │  │
│  │  - GET /health (health check)                             │  │
│  └────────────────────┬───────────────────────────────────────┘  │
└────────────────────────┼───────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                         n8n (Agent Platform)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Webhook Trigger: /webhook/discord-message                │  │
│  │  ↓                                                         │  │
│  │  Agent Router Node                                        │  │
│  │  - Detect which agent (@Laura, @Luka, @Nino)             │  │
│  │  ↓                                                         │  │
│  │  ┌──────────┬──────────┬──────────┐                      │  │
│  │  │ Laura    │  Luka    │  Nino    │                      │  │
│  │  │ Workflow │ Workflow │ Workflow │                      │  │
│  │  └────┬─────┴────┬─────┴────┬─────┘                      │  │
│  │       │          │          │                             │  │
│  │       └──────────┴──────────┘                             │  │
│  │                  │                                         │  │
│  │                  ↓                                         │  │
│  │  OpenAI Agent Node                                        │  │
│  │  - Execute agent with context                             │  │
│  │  - Generate response                                      │  │
│  │  ↓                                                         │  │
│  │  HTTP Request Node                                        │  │
│  │  - POST back to Discord bot                               │  │
│  │  - URL: https://discord-bot-url/webhook/n8n-response     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Webhook URLs:                                                   │
│  - IN: https://n8n-url/webhook/discord-message                  │
│  - OUT: Posts to Discord bot /webhook/n8n-response              │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (Separate Database)                 │
│  - conversations                                                 │
│  - messages (for audit/history)                                 │
│  - student_profiles                                             │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAI API (via n8n)                          │
│  - Agent execution                                               │
│  - Response generation                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Flow

### Complete Flow (Step-by-Step)

```
1. Student sends message in Discord
   "@Laura I need help with my project"
   ↓

2. Discord Gateway → WebSocket → Discord Bot (Cloud Run)
   ↓

3. Discord Bot:
   - Extracts message data
   - Identifies agent (Laura)
   - Loads last 15 messages from database
   - Saves student message to database
   ↓

4. Discord Bot → Webhook POST to n8n
   POST https://n8n-url/webhook/discord-message
   {
     "agent": "laura",
     "user_id": "discord_user_123",
     "user_name": "StudentName",
     "message": "I need help with my project",
     "conversation_history": [
       {"role": "user", "content": "Previous message..."},
       {"role": "assistant", "content": "Laura's previous response..."}
     ],
     "channel_id": "discord_channel_456",
     "callback_url": "https://discord-bot-url/webhook/n8n-response"
   }
   ↓

5. n8n Workflow:
   - Receives webhook
   - Routes to Laura workflow (based on "agent" field)
   - Executes OpenAI agent with context
   - Generates response
   ↓

6. n8n → Webhook POST back to Discord Bot
   POST https://discord-bot-url/webhook/n8n-response
   {
     "channel_id": "discord_channel_456",
     "response": "Let's align on priorities. What's blocking your delivery?",
     "agent": "laura"
   }
   ↓

7. Discord Bot:
   - Receives response from n8n
   - Sends message to Discord channel
   - Saves agent response to database
   ↓

8. Student sees response in Discord
```

---

## 🎯 Responsibilities (Updated)

### Discord Bot (Node.js on Cloud Run)
**SIMPLE - Just a Bridge**

✅ **Does**:
- Listen to Discord messages
- Send webhooks to n8n
- Receive webhooks from n8n
- Send responses to Discord
- Store messages in database
- Load conversation history

❌ **Doesn't Do**:
- Agent logic (n8n does this)
- OpenAI calls (n8n does this)
- Agent routing logic (n8n does this)
- Context management (n8n does this)

### n8n (Agent Platform)
**SMART - All the Logic**

✅ **Does**:
- Agent routing (Laura vs Luka vs Nino)
- OpenAI agent execution
- Conversation context management
- Response generation
- Complex workflows
- Tool integrations (if needed)

---

## 📊 Database Schema (Simplified)

Since n8n handles agent logic, database is simpler:

```sql
-- 1. Conversations (same as before)
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  channel_type TEXT NOT NULL,
  guild_id TEXT,
  channel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Messages (audit trail + context for n8n)
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id),
  discord_message_id TEXT NOT NULL UNIQUE,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'agent')),
  agent_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Profiles (basic tracking)
CREATE TABLE student_profiles (
  discord_user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INT DEFAULT 0
);

-- No need for agent_configs or conversation_summaries
-- n8n handles that!
```

---

## 🔐 Security

### Webhook Security

**Discord Bot → n8n**:
```typescript
// Include secret in webhook
headers: {
  'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`
}
```

**n8n → Discord Bot**:
```typescript
// Verify secret from n8n
if (req.headers.authorization !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Environment Variables

```bash
# Discord
DISCORD_LAURA_TOKEN=...
DISCORD_LUKA_TOKEN=...
DISCORD_NINO_TOKEN=...

# n8n
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/discord-message
N8N_WEBHOOK_SECRET=<strong-random-secret>

# Database
DATABASE_URL=postgresql://...

# App
NODE_ENV=production
PORT=3000
```

---

## 📦 Technology Stack (Simplified)

### Discord Bot (Much Simpler!)

```json
{
  "dependencies": {
    "discord.js": "^14.14.0",
    "pg": "^8.11.0",
    "express": "^4.18.0",  // For webhook endpoint
    "dotenv": "^16.3.0",
    "axios": "^1.6.0"      // For HTTP requests to n8n
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.0"
  }
}
```

**Removed**:
- ❌ `openai` - Not needed, n8n handles this
- ❌ Complex agent logic
- ❌ Context management
- ❌ OpenAI SDK integration

---

## 📁 Project Structure (Simplified)

```
discord-bots/
├── src/
│   ├── index.ts                    # Main entry (Discord + Express)
│   │
│   ├── config/
│   │   ├── env.ts                  # Environment variables
│   │   └── discord.ts              # Discord config
│   │
│   ├── database/
│   │   ├── connection.ts           # PostgreSQL pool
│   │   ├── conversations.ts        # Conversation queries
│   │   └── messages.ts             # Message queries
│   │
│   ├── discord/
│   │   ├── client.ts               # Discord client setup
│   │   └── handlers/
│   │       ├── message.ts          # Message handler
│   │       └── ready.ts            # Ready handler
│   │
│   ├── webhooks/
│   │   ├── n8n-sender.ts          # Send to n8n
│   │   └── n8n-receiver.ts        # Receive from n8n
│   │
│   └── utils/
│       ├── logger.ts               # Logging
│       └── errors.ts               # Error handling
│
├── n8n-workflows/                  # n8n workflow exports
│   ├── laura-agent.json
│   ├── luka-agent.json
│   └── nino-agent.json
│
├── sql/
│   └── 001_init.sql
│
├── Dockerfile
├── package.json
└── README.md
```

**Much Simpler**: ~15-20 files instead of 40!

---

## 🎨 n8n Workflow Design

### Workflow: Discord Message Handler

```
[Webhook Trigger]
  ↓
[Function: Parse Discord Data]
  ↓
[Switch: Determine Agent]
  ├─ @Laura → [Laura Agent]
  ├─ @Luka → [Luka Agent]
  └─ @Nino → [Nino Agent]
      ↓
[OpenAI Agent Node]
  ↓
[Function: Format Response]
  ↓
[HTTP Request: Send to Discord Bot]
```

### Webhook Payload (Discord Bot → n8n)

```json
{
  "agent": "laura",
  "user": {
    "id": "discord_user_123",
    "username": "StudentName#1234",
    "display_name": "Student Name"
  },
  "message": {
    "content": "I need help with my project",
    "channel_id": "discord_channel_456",
    "guild_id": "discord_guild_789",
    "message_id": "discord_msg_101112"
  },
  "conversation_history": [
    {
      "role": "user",
      "content": "Previous message from student"
    },
    {
      "role": "assistant",
      "content": "Previous response from Laura"
    }
  ],
  "callback": {
    "url": "https://discord-bot-url/webhook/n8n-response",
    "channel_id": "discord_channel_456"
  }
}
```

### Response Payload (n8n → Discord Bot)

```json
{
  "channel_id": "discord_channel_456",
  "response": "Let's align on priorities. What's blocking your delivery? I need concrete dates and ownership by EOD.",
  "agent": "laura",
  "metadata": {
    "processing_time_ms": 1250,
    "tokens_used": 350
  }
}
```

---

## 💰 Cost Estimate (Updated)

### Development
- **Time**: 2-3 days (much faster!)
- **n8n**: $0 (if self-hosted) or $20/month (cloud)

### Monthly Running Costs
```
Cloud Run (Discord Bot): ~$10-15/month (always-on)
Neon Database: $0 (free tier)
n8n: $0 (self-hosted) or $20/month (cloud)
OpenAI API: $20-50/month (via n8n)

Total: 
  - Self-hosted n8n: ~$30-65/month
  - n8n Cloud: ~$50-85/month
```

---

## ⏱️ Updated Timeline

```
Day 1: Discord Bot + Database (6 hours)
  ├─ Project setup
  ├─ Discord client
  ├─ Database schema
  └─ Basic message handling

Day 2: Webhook Integration (4 hours)
  ├─ Express server
  ├─ Send webhook to n8n
  ├─ Receive webhook from n8n
  └─ Test end-to-end

Day 3: n8n Workflows (6 hours)
  ├─ Create Laura workflow
  ├─ Create Luka workflow
  ├─ Create Nino workflow
  └─ Test all agents

Total: 2-3 days (instead of 5-7 days!)
```

---

## ✅ Advantages of n8n Architecture

### 1. **Simpler Discord Bot**
- Just a bridge/relay
- Less code to maintain
- Easier to debug

### 2. **Flexible Agent Logic**
- Change agent behavior in n8n (no code deployment)
- Visual workflow editor
- Easy to add tools/integrations

### 3. **Better Separation of Concerns**
- Discord bot: Messaging infrastructure
- n8n: Business logic
- Database: Persistence

### 4. **Easier Testing**
- Test n8n workflows independently
- Test Discord bot as simple webhook relay
- Mock n8n responses easily

### 5. **Non-Technical Management**
- Modify agent prompts in n8n UI
- Adjust workflows without coding
- Add new agents without deployment

---

## 🔧 Configuration

### Discord Bot Environment Variables

```bash
# Discord Bots
DISCORD_LAURA_TOKEN=...
DISCORD_LUKA_TOKEN=...
DISCORD_NINO_TOKEN=...

# n8n Integration
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/discord-message
N8N_WEBHOOK_SECRET=<generate-with-openssl-rand-base64-32>

# Database
DATABASE_URL=postgresql://...

# Server
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info
```

### n8n Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Discord Bot Callback
DISCORD_BOT_URL=https://discord-bot-url.run.app
DISCORD_WEBHOOK_SECRET=<same-as-discord-bot>

# n8n Config
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<strong-password>
```

---

## 📊 Monitoring

### Discord Bot Metrics
- Messages received
- Webhooks sent to n8n
- Webhooks received from n8n
- Database queries
- Errors

### n8n Metrics (Built-in)
- Workflow executions
- Success/failure rate
- Execution time
- OpenAI token usage

---

## 🎯 Success Criteria

### Phase 1: Discord Bot (Day 1)
- [ ] Bot connects to Discord
- [ ] Receives messages
- [ ] Stores in database
- [ ] Health check endpoint works

### Phase 2: Webhook Integration (Day 2)
- [ ] Sends webhook to n8n
- [ ] Receives webhook from n8n
- [ ] Sends response to Discord
- [ ] End-to-end test works

### Phase 3: n8n Workflows (Day 3)
- [ ] All 3 agent workflows created
- [ ] Agents respond correctly
- [ ] Distinct personalities evident
- [ ] Production ready

---

## 🚀 Deployment

### Discord Bot → Cloud Run
```yaml
Service: codeless-discord-bots
Port: 3000
Memory: 256Mi (reduced - simpler service)
CPU: 0.5 (reduced)
Min Instances: 1
Max Instances: 2
```

### n8n → Cloud Run or Self-Hosted
**Option A**: Cloud Run
- Deploy n8n as separate service
- Persistent storage for workflows

**Option B**: Self-Hosted (VPS/Railway)
- More control
- Potentially cheaper
- Better for workflow management

---

## 📚 Documentation Updates

All documentation will be updated to reflect:
- Simpler Discord bot
- n8n as agent platform
- Webhook-based architecture
- Reduced timeline (2-3 days)

---

## ✨ Summary of Changes

| Aspect | Before (OpenAI SDK) | After (n8n) |
|--------|---------------------|-------------|
| **Complexity** | High | Low |
| **Code** | ~40 files | ~15-20 files |
| **Timeline** | 5-7 days | 2-3 days |
| **Agent Logic** | In Node.js code | In n8n workflows |
| **Flexibility** | Need code changes | Change in n8n UI |
| **Dependencies** | OpenAI SDK, complex | Simple HTTP/webhooks |
| **Testing** | Complex | Easier (separate components) |
| **Management** | Technical | Visual (n8n UI) |

---

**Document Status**: ✅ Complete (Updated for n8n)  
**Next Step**: Create updated implementation plan  
**Timeline**: 2-3 days (reduced from 5-7)

