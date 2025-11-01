# Discord Multi-Agent Bots - Quick Start Guide

**TL;DR**: Create 3 AI bots (Laura, Luka, Nino) that chat with students on Discord.

---

## 🎯 What We're Building

**3 Discord Bots** that act as different personas:
- **Laura** (VP Product) - Demanding, business-focused
- **Luka** (Tech Lead) - Helpful, code-focused  
- **Nino** (QA Lead) - Detail-oriented, quality-focused

Students can chat with them on Discord:
- In DMs: Bot responds automatically
- In channels: `@Laura help me` → Laura responds

---

## 🏗️ Simple Architecture

```
Discord Server
    ↓ (WebSocket)
Cloud Run (Node.js Service)
    ├─ Discord Client (listens to messages)
    ├─ Agent Router (which bot to use?)
    ├─ OpenAI (generates responses)
    └─ Database (stores chat history)
```

---

## 📋 What You Need

### 1. Discord Setup
- [ ] 3 Discord bot accounts (free)
- [ ] Test Discord server (free)

### 2. Database
- [ ] Neon PostgreSQL database (free tier)

### 3. APIs
- [ ] OpenAI API key (you have this)

### 4. Hosting
- [ ] Cloud Run service (you have this)

---

## ⏱️ Timeline

```
Phase 1: Setup (Day 1-2)          ████████░░░░░░░░
Phase 2: First Bot (Day 3)        ░░░░░░░░████░░░░
Phase 3: All 3 Bots (Day 4)       ░░░░░░░░░░░░████
Phase 4: Deploy (Day 5)           ░░░░░░░░░░░░░░░░████
```

**Total**: 5 days

---

## 💻 Tech Stack

**Why Node.js?**
- Best Discord library (discord.js)
- Easy to work with OpenAI
- You already use it in frontend serverless functions

**Key Libraries**:
- `discord.js` - Talk to Discord
- `openai` - Talk to OpenAI  
- `pg` - Talk to database
- `typescript` - Type safety

---

## 📂 Project Structure

```
discord-bots/
├── src/
│   ├── agents/
│   │   ├── laura.ts    (Laura's personality)
│   │   ├── luka.ts     (Luka's personality)
│   │   └── nino.ts     (Nino's personality)
│   ├── discord/
│   │   └── client.ts   (Connect to Discord)
│   └── database/
│       └── queries.ts  (Save/load messages)
├── Dockerfile          (For Cloud Run)
└── .env                (Secrets - never commit!)
```

---

## 🚀 How It Works

### 1. Message Arrives
```
Student: "@Laura I need help with my project deadline"
```

### 2. Bot Processes
```typescript
// Detect which agent
if (message mentions @Laura) {
  agent = LauraAgent
}

// Load conversation history
history = database.getLastMessages(15)

// Ask OpenAI
response = await openai.chat(laura_prompt + history + new_message)

// Reply
discord.send(response)

// Save to database
database.saveMessage(student_message, bot_response)
```

### 3. Student Sees Response
```
Laura: "Let's align on priorities. What's blocking 
your delivery? I need concrete dates and ownership."
```

---

## 🔒 Security

### ✅ Completely Separate From Platform
- Own database (no access to student data)
- Own Cloud Run service
- Own environment variables

### ✅ No Integration Needed
- Doesn't call your backend
- Doesn't call your frontend
- Fully standalone

---

## 💰 Cost

### Development
- OpenAI testing: ~$5-10

### Monthly Running
- Cloud Run: ~$10-15 (always-on)
- Database: $0 (free tier)
- OpenAI: ~$20-50 (depends on usage)

**Total**: ~$30-75/month

---

## 📊 Database Schema (Simple)

```sql
conversations
├─ id
├─ discord_channel_id
└─ created_at

messages
├─ id
├─ conversation_id
├─ sender (student or bot)
├─ content (the text)
└─ created_at

student_profiles
├─ discord_user_id
├─ username
└─ message_count
```

---

## 🎯 MVP Features

**What's Included**:
- ✅ 3 agents with distinct personalities
- ✅ DM and channel support
- ✅ Conversation history (context)
- ✅ Message persistence
- ✅ Always-on (Cloud Run)

**What's NOT Included** (can add later):
- ❌ Slash commands
- ❌ Integration with your platform
- ❌ Admin dashboard
- ❌ Analytics
- ❌ Custom agent configs

---

## 🚦 Getting Started

### Step 1: Create Discord Bots (30 min)
1. Go to https://discord.com/developers/applications
2. Create 3 applications (Laura, Luka, Nino)
3. Get bot tokens
4. Invite to test server

### Step 2: Create Database (15 min)
1. Go to Neon dashboard
2. Create new database: `discord_bots`
3. Run SQL schema
4. Get connection string

### Step 3: Code (3-4 days)
1. Follow implementation plan
2. Test locally
3. Deploy to Cloud Run

---

## 📚 Documentation

- `docs/discord-bots/ARCHITECTURE.md` - Technical details
- `docs/discord-bots/IMPLEMENTATION_PLAN.md` - Step-by-step guide
- This file - Quick overview

---

## ❓ FAQ

### Q: Why not add to existing backend?
A: Discord needs always-on WebSocket. Your backend is stateless HTTP.

### Q: Why separate database?
A: Clean separation. Bot doesn't need access to courses/users.

### Q: Can students chat with bots about course content?
A: Not initially. We'd need to integrate with your platform API (Phase 2).

### Q: What if OpenAI is expensive?
A: Add rate limits (5 messages per student per hour).

### Q: What happens if bot goes down?
A: Cloud Run will restart it automatically. Messages during downtime are missed.

### Q: Can I add more agents later?
A: Yes! Just create new agent class and add to router.

---

## 🎉 Success Looks Like

**After Phase 1**:
```
✅ Bot comes online in Discord
✅ Can see it in member list
✅ Database has tables
```

**After Phase 2**:
```
You: "@Laura help me"
Laura: "Let's cut to the chase..."
✅ Bot responds with Laura's personality
```

**After Phase 3**:
```
You: "@Luka what about this code?"
Luka: "Let me help you with that..."
✅ All 3 agents working
```

**After Phase 4**:
```
✅ Running in Cloud Run
✅ Always online
✅ Production ready
```

---

## 🚀 Ready to Start?

1. Read `IMPLEMENTATION_PLAN.md` for detailed steps
2. Start with Phase 1.1: Project Initialization
3. Follow the checklist one step at a time

**First command**:
```bash
cd C:\Users\Ryzen\Desktop\Codeless_Web
mkdir discord-bots
cd discord-bots
npm init -y
```

---

**Questions?** Check the implementation plan or ask me! 🤝

