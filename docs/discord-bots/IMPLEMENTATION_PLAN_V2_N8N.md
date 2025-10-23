# Discord Multi-Agent Bots with n8n - Implementation Plan

**Created**: October 22, 2025  
**Updated for**: n8n Integration  
**Estimated Timeline**: 2-3 days  
**Complexity**: Low (Simplified!)

---

## 🎯 What Changed?

### Before (OpenAI SDK in Node.js)
- Complex agent logic in code
- OpenAI integration in Node.js
- 40+ files
- 5-7 days

### After (n8n Workflows)
- Simple webhook bridge
- n8n handles all agent logic
- ~20 files
- 2-3 days ✅

---

## 📊 Implementation Phases

```
Day 1: Discord Bot + Webhooks  [███████░░░░░░░░░]
Day 2: n8n Workflows           [░░░░░░░█████████]
Day 3: Testing + Deploy        [░░░░░░░░░░░░░███]
```

**Total**: 2-3 days

---

## 📋 Day 1: Discord Bot Foundation (6-8 hours)

### 1.1 Project Setup (1 hour)

**Tasks**:
- [ ] Create `discord-bots/` directory
- [ ] Initialize npm project
- [ ] Install dependencies
- [ ] Set up TypeScript
- [ ] Create folder structure

**Commands**:
```bash
cd C:\Users\Ryzen\Desktop\Codeless_Web
mkdir discord-bots
cd discord-bots

npm init -y
npm install discord.js express pg dotenv axios
npm install -D typescript tsx @types/node @types/express @types/pg

npx tsc --init
```

**Files to Create**:
```
discord-bots/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── src/
    └── (empty for now)
```

**package.json scripts**:
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

### 1.2 Database Setup (1 hour)

**Tasks**:
- [ ] Create new Neon database: `discord_bots`
- [ ] Write SQL schema
- [ ] Create connection pool
- [ ] Test connection

**Files to Create**:
- `sql/001_init.sql`
- `src/database/connection.ts`
- `src/database/conversations.ts`
- `src/database/messages.ts`

**SQL Schema** (`sql/001_init.sql`):
```sql
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  channel_type TEXT NOT NULL,
  guild_id TEXT,
  channel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE student_profiles (
  discord_user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INT DEFAULT 0
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
```

**Test**:
```bash
# Apply schema
psql "$DATABASE_URL" -f sql/001_init.sql

# Test in code
npm run dev
```

---

### 1.3 Discord Client Setup (2 hours)

**Tasks**:
- [ ] Create Discord applications (Laura, Luka, Nino)
- [ ] Get bot tokens
- [ ] Set up Discord.js client
- [ ] Handle message events
- [ ] Test bot connection

**Files to Create**:
- `src/config/env.ts`
- `src/config/discord.ts`
- `src/discord/client.ts`
- `src/discord/handlers/message.ts`
- `src/discord/handlers/ready.ts`

**Discord Portal Steps**:
1. Go to https://discord.com/developers/applications
2. Create 3 applications: Laura, Luka, Nino
3. For each bot:
   - Go to Bot tab
   - Enable "Message Content Intent"
   - Copy token
4. Generate OAuth2 URL with bot scope + permissions
5. Invite all 3 bots to test server

**Basic Message Handler**:
```typescript
// src/discord/handlers/message.ts
export async function handleMessage(message: Message) {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Determine if bot should respond
  const shouldRespond = 
    message.channel.isDMBased() || 
    message.mentions.users.has(client.user!.id);
  
  if (!shouldRespond) return;
  
  // Detect agent
  const agent = detectAgent(message);
  
  // Save to database
  await saveMessage(message);
  
  // Send to n8n (next phase)
  await sendToN8n(message, agent);
}
```

**Test**:
- [ ] Bot comes online in Discord
- [ ] Bot can see messages
- [ ] Logs messages to console

---

### 1.4 Express Webhook Server (2 hours)

**Tasks**:
- [ ] Set up Express server
- [ ] Create `/webhook/n8n-response` endpoint
- [ ] Create `/health` endpoint
- [ ] Verify webhook security

**Files to Create**:
- `src/index.ts` (combines Discord client + Express server)
- `src/webhooks/receiver.ts`
- `src/utils/security.ts`

**Express Setup** (`src/index.ts`):
```typescript
import express from 'express';
import { Client } from 'discord.js';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Receive response from n8n
app.post('/webhook/n8n-response', webhookReceiver);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Webhook server listening on port ${PORT}`);
});

// Start Discord client
const client = new Client({ intents: [...] });
client.login(process.env.DISCORD_LAURA_TOKEN);
```

**Webhook Receiver**:
```typescript
// src/webhooks/receiver.ts
export async function webhookReceiver(req, res) {
  // Verify secret
  if (req.headers.authorization !== `Bearer ${process.env.N8N_WEBHOOK_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { channel_id, response, agent } = req.body;
  
  // Send to Discord
  const channel = await client.channels.fetch(channel_id);
  await channel.send(response);
  
  // Save to database
  await saveAgentMessage(channel_id, agent, response);
  
  res.json({ success: true });
}
```

**Test**:
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test webhook (with mock n8n response)
curl -X POST http://localhost:3000/webhook/n8n-response \
  -H "Authorization: Bearer test-secret" \
  -H "Content-Type: application/json" \
  -d '{"channel_id":"123","response":"Test","agent":"laura"}'
```

---

### 1.5 n8n Webhook Sender (1-2 hours)

**Tasks**:
- [ ] Create n8n webhook sender
- [ ] Load conversation history
- [ ] Format payload for n8n
- [ ] Handle errors

**Files to Create**:
- `src/webhooks/sender.ts`
- `src/utils/history.ts`

**Webhook Sender**:
```typescript
// src/webhooks/sender.ts
import axios from 'axios';

export async function sendToN8n(message: Message, agent: string) {
  // Load conversation history (last 15 messages)
  const history = await getConversationHistory(message.channel.id, 15);
  
  // Format payload
  const payload = {
    agent,
    user: {
      id: message.author.id,
      username: message.author.username,
      display_name: message.author.displayName
    },
    message: {
      content: message.content,
      channel_id: message.channel.id,
      guild_id: message.guild?.id,
      message_id: message.id
    },
    conversation_history: history,
    callback: {
      url: `${process.env.DISCORD_BOT_URL}/webhook/n8n-response`,
      channel_id: message.channel.id
    }
  };
  
  // Send to n8n
  try {
    await axios.post(process.env.N8N_WEBHOOK_URL!, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Show typing indicator while waiting
    await message.channel.sendTyping();
  } catch (error) {
    console.error('Error sending to n8n:', error);
    await message.reply('Sorry, I encountered an error. Please try again.');
  }
}
```

**Test**:
- [ ] Message in Discord triggers n8n webhook
- [ ] Payload format is correct
- [ ] Error handling works

---

## 📋 Day 2: n8n Workflows (6-8 hours)

### 2.1 n8n Setup (1 hour)

**Tasks**:
- [ ] Set up n8n (cloud or self-hosted)
- [ ] Configure credentials
- [ ] Create webhook endpoints
- [ ] Test basic workflow

**n8n Setup Options**:

**Option A: n8n Cloud** (Easiest)
1. Go to https://n8n.io
2. Sign up for account
3. Create new workflow
4. Get webhook URL

**Option B: Self-Hosted** (More control)
```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Environment Variables in n8n**:
```bash
OPENAI_API_KEY=sk-...
DISCORD_BOT_URL=https://your-cloud-run-url.run.app
DISCORD_WEBHOOK_SECRET=<same-as-bot>
```

---

### 2.2 Laura Agent Workflow (2 hours)

**Tasks**:
- [ ] Create workflow: "Discord - Laura Agent"
- [ ] Add webhook trigger
- [ ] Add OpenAI agent node
- [ ] Add HTTP response node
- [ ] Test with Discord

**Workflow Structure**:
```
1. [Webhook Trigger]
   URL: /webhook/discord-message
   Method: POST
   
2. [Function Node: Parse Input]
   Extract: agent, user, message, history
   
3. [Switch Node: Route by Agent]
   Case: agent === 'laura' → Continue
   Case: else → Stop
   
4. [OpenAI Agent Node]
   Model: gpt-4 or your agent
   System Prompt: "You are Stakeholder Laura (VP Product Strategy).
                   Business-first, high power; push deadlines/KPIs..."
   Context: {{ $node["Parse Input"].json["conversation_history"] }}
   Message: {{ $node["Parse Input"].json["message"]["content"] }}
   
5. [Function Node: Format Response]
   output = {
     channel_id: input.message.channel_id,
     response: openai_response,
     agent: 'laura'
   }
   
6. [HTTP Request Node]
   Method: POST
   URL: {{ $node["Parse Input"].json["callback"]["url"] }}
   Headers: 
     Authorization: Bearer {{ $env.DISCORD_WEBHOOK_SECRET }}
   Body: {{ $node["Format Response"].json }}
```

**Laura's System Prompt**:
```
You are **Laura Stakeholder**, a corporate VP (Product Strategy).

CORE: Business-first, high power, approves scope, threatens escalation when needed.

GOAL: Fast delivery with measurable business impact. Maintain political dominance.

COMMUNICATION STYLE:
- Corporate, assertive, concise. Business language only.
- Avoid deep tech; push outcomes, deadlines, KPIs, ownership.
- Ask pointed questions when needed; demand clarity.

TONE VARIATIONS:
1) Impatient Driver — "Deliver fast. No excuses."
2) Passive-Aggressive — "We agreed on this. Disappointing."
3) Corporate Politician — optics, leadership visibility.
4) Escalation Enforcer — threatens escalation to management.

Keep responses under 400 characters for Discord.
```

**Test**:
- [ ] Send test payload to n8n webhook
- [ ] Workflow executes successfully
- [ ] Response sent back to Discord bot
- [ ] Message appears in Discord

---

### 2.3 Luka & Nino Agent Workflows (2 hours)

**Tasks**:
- [ ] Duplicate Laura workflow
- [ ] Create Luka agent workflow
- [ ] Create Nino agent workflow
- [ ] Customize prompts
- [ ] Test all 3 agents

**Luka's System Prompt** (Technical Lead):
```
You are **Luka**, a Senior Technical Lead and mentor.

CORE: Patient, technical, helpful. You guide through code and architecture.

GOAL: Help students write better code, understand concepts deeply.

COMMUNICATION STYLE:
- Technical but accessible
- Use code examples when helpful
- Patient with questions
- Encourage best practices

PERSONALITY:
- Supportive and encouraging
- Explains "why" not just "what"
- Shares real-world experience
- Celebrates good solutions

Keep responses under 400 characters for Discord.
```

**Nino's System Prompt** (QA Lead):
```
You are **Nino**, a QA Lead focused on quality and testing.

CORE: Detail-oriented, thorough, quality-focused. You catch what others miss.

GOAL: Ensure high quality deliverables through proper testing.

COMMUNICATION STYLE:
- Precise and detail-oriented
- Ask probing questions
- Focus on edge cases
- Quality over speed

PERSONALITY:
- Methodical and systematic
- Catches potential issues early
- Advocates for proper testing
- Values documentation

Keep responses under 400 characters for Discord.
```

**Workflow Updates**:
```
3. [Switch Node: Route by Agent]
   Case: agent === 'laura' → Laura Flow
   Case: agent === 'luka' → Luka Flow
   Case: agent === 'nino' → Nino Flow
```

**Test**:
- [ ] @Laura responds with business focus
- [ ] @Luka responds with technical help
- [ ] @Nino responds with quality focus
- [ ] Each has distinct personality

---

### 2.4 Error Handling & Polish (1 hour)

**Tasks**:
- [ ] Add error handling in workflows
- [ ] Add timeout handling
- [ ] Add retry logic
- [ ] Test edge cases

**n8n Error Handling**:
```
Add after OpenAI node:
[Error Trigger Node]
  → [HTTP Request: Send Error to Discord]
  
Error Response:
{
  channel_id: "...",
  response: "I encountered an error. Please try again in a moment.",
  agent: "system"
}
```

**Test Cases**:
- [ ] OpenAI API timeout
- [ ] Invalid webhook payload
- [ ] Network error
- [ ] Rate limit exceeded

---

## 📋 Day 3: Testing & Deployment (4-6 hours)

### 3.1 Integration Testing (2 hours)

**Test Scenarios**:

**1. Basic Conversation**
```
You: "@Laura I need help"
Laura: [Business-focused response]
✓ Message received
✓ Webhook sent to n8n
✓ Response received
✓ Message sent to Discord
✓ Saved to database
```

**2. Agent Switching**
```
You: "@Laura help with strategy"
Laura: [Responds]
You: "@Luka show me code"
Luka: [Responds]
✓ Correct agent responds each time
```

**3. DM Conversation**
```
You: (DM to Laura) "Help me"
Laura: [Responds in DM]
✓ Works in DM without mention
```

**4. Conversation Context**
```
You: "I'm working on a project"
Laura: [Responds]
You: "What was I working on?"
Laura: [Remembers: "Your project"]
✓ Context preserved across messages
```

**5. Error Scenarios**
```
- n8n down → User sees error message
- OpenAI timeout → User sees retry message
- Invalid input → Graceful error
```

**Checklist**:
- [ ] All 3 agents work
- [ ] Context is maintained
- [ ] Errors handled gracefully
- [ ] Database stores correctly
- [ ] No crashes or hangs

---

### 3.2 Docker & Cloud Run (2 hours)

**Tasks**:
- [ ] Create Dockerfile
- [ ] Build and test locally
- [ ] Create cloudbuild.yaml
- [ ] Deploy to Cloud Run
- [ ] Set environment variables

**Dockerfile**:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**cloudbuild.yaml**:
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/discord-bots', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/discord-bots']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'codeless-discord-bots'
      - '--image'
      - 'gcr.io/$PROJECT_ID/discord-bots'
      - '--region'
      - 'europe-west1'
      - '--platform'
      - 'managed'
      - '--min-instances'
      - '1'
      - '--memory'
      - '256Mi'
```

**Deploy**:
```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml

# Set environment variables
gcloud run services update codeless-discord-bots \
  --set-env-vars="DISCORD_LAURA_TOKEN=...,N8N_WEBHOOK_URL=...,..."
```

---

### 3.3 Documentation & Monitoring (1 hour)

**Tasks**:
- [ ] Update README
- [ ] Document environment variables
- [ ] Add troubleshooting guide
- [ ] Set up logging
- [ ] Create runbook

**README.md**:
- Setup instructions
- Environment variables list
- How to add new agents
- Troubleshooting

**Monitoring**:
- Cloud Run logs
- n8n execution logs
- Database query performance
- Error rates

---

## ✅ Project Checklist

### Code Files
- [ ] `src/index.ts` (Discord + Express)
- [ ] `src/config/env.ts`
- [ ] `src/config/discord.ts`
- [ ] `src/database/connection.ts`
- [ ] `src/database/conversations.ts`
- [ ] `src/database/messages.ts`
- [ ] `src/discord/client.ts`
- [ ] `src/discord/handlers/message.ts`
- [ ] `src/discord/handlers/ready.ts`
- [ ] `src/webhooks/sender.ts`
- [ ] `src/webhooks/receiver.ts`
- [ ] `src/utils/logger.ts`
- [ ] `src/utils/security.ts`
- [ ] `src/utils/history.ts`

### Configuration Files
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `.env.example`
- [ ] `.gitignore`
- [ ] `Dockerfile`
- [ ] `cloudbuild.yaml`

### Database
- [ ] `sql/001_init.sql`
- [ ] Neon database created
- [ ] Schema applied

### n8n
- [ ] Laura agent workflow
- [ ] Luka agent workflow
- [ ] Nino agent workflow

### Documentation
- [ ] `README.md`
- [ ] `docs/discord-bots/ARCHITECTURE_V2_N8N.md`
- [ ] `docs/discord-bots/IMPLEMENTATION_PLAN_V2_N8N.md`
- [ ] `docs/discord-bots/TROUBLESHOOTING.md`

### Deployment
- [ ] Discord bots created
- [ ] Bots invited to server
- [ ] Cloud Run service deployed
- [ ] Environment variables set
- [ ] n8n workflows active

---

## 💰 Final Cost Estimate

```
Development Time: 2-3 days (16-20 hours)

Monthly Running Costs:
├─ Cloud Run (Discord Bot): $10-15
├─ Neon Database: $0 (free tier)
├─ n8n Cloud: $0-20 (self-hosted vs cloud)
└─ OpenAI API: $20-50

Total: $30-85/month
```

---

## 🎯 Success Metrics

### Day 1 Complete
- [ ] Discord bot online
- [ ] Database working
- [ ] Webhook server running
- [ ] Can send/receive webhooks

### Day 2 Complete
- [ ] All 3 n8n workflows created
- [ ] Agents respond correctly
- [ ] Distinct personalities evident

### Day 3 Complete
- [ ] Deployed to Cloud Run
- [ ] Production testing complete
- [ ] Documentation finished
- [ ] No critical bugs

---

## 🚀 Ready to Start?

**First Commands**:
```bash
cd C:\Users\Ryzen\Desktop\Codeless_Web
mkdir discord-bots
cd discord-bots
npm init -y
```

Then follow Day 1, Section 1.1!

---

**Document Status**: ✅ Complete (Updated for n8n)  
**Timeline**: 2-3 days  
**Next Step**: Begin Day 1.1 - Project Setup

