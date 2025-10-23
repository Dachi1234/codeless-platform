# 🚀 Getting Started with Discord Bots

Welcome! Your Discord bot project is ready. Here's everything you need to know.

---

## 📦 What's Been Created

### Project Structure

```
discord-bots/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Entry point
│   ├── bot.ts                    # Main bot logic
│   ├── config.ts                 # Configuration
│   └── services/
│       ├── database.service.ts   # PostgreSQL operations
│       └── n8n.service.ts        # n8n webhook client
├── sql/
│   ├── 001_discord_schema.sql    # Database schema
│   └── README.md                 # SQL setup guide
├── env.example                   # Environment template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── GETTING_STARTED.md            # 👈 You are here
├── QUICK_CHECKLIST.md            # Fast setup checklist
├── SETUP_GUIDE.md                # Detailed setup guide
├── N8N_WORKFLOW_GUIDE.md         # n8n workflows
└── README.md                     # Full documentation
```

### Features Implemented ✅

- ✅ **Discord.js 14** integration with all required intents
- ✅ **PostgreSQL** (Neon) with connection pooling
- ✅ **Conversation tracking** (channels, messages, users)
- ✅ **n8n webhook** integration with retry logic
- ✅ **Conversation context** (last N messages sent to agent)
- ✅ **Error handling** with user-friendly messages
- ✅ **Graceful shutdown** (SIGINT/SIGTERM)
- ✅ **TypeScript** with strict mode
- ✅ **Hot reload** for development (tsx watch)
- ✅ **Logging** with detailed request/response info

---

## 🎯 What You Need to Do

### Option 1: Quick Start (30 minutes) ⚡

Follow the **checklist**:

```bash
cd discord-bots/
cat QUICK_CHECKLIST.md
```

This is the **fastest way** to get your bot running.

### Option 2: Detailed Guide (45 minutes) 📖

Follow the **step-by-step guide**:

```bash
cd discord-bots/
cat SETUP_GUIDE.md
```

This explains **why** each step is needed.

---

## 📝 Summary of Steps

1. **Database**: Run SQL script in Neon Console
2. **Discord**: Create bot application, get token
3. **n8n**: Create webhook workflow (simple echo for testing)
4. **Config**: Copy `env.example` to `.env`, fill in secrets
5. **Install**: Run `npm install`
6. **Test**: Run `npm run dev`, send message to bot

---

## 🔑 Required Credentials

You need these 3 secrets:

| Secret | Where to Get | Where to Put |
|--------|--------------|--------------|
| `DISCORD_BOT_TOKEN` | Discord Developer Portal | `.env` |
| `DATABASE_URL` | Neon Console | `.env` |
| `N8N_WEBHOOK_URL` | n8n Workflow | `.env` |

---

## 🧪 Testing Strategy

### Phase 1: Echo Bot (Day 1)
- Use simple n8n Code node
- No AI yet
- Verifies: Discord ↔️ n8n ↔️ Database

### Phase 2: Basic AI (Day 2)
- Add OpenAI node to n8n
- No conversation memory
- Verifies: AI responses work

### Phase 3: Context Memory (Day 3)
- Use conversation history
- Maintain context across messages
- Verifies: Bot remembers conversation

### Phase 4: RAG (Day 4+)
- Query your course database
- Course-specific answers
- Verifies: Database integration works

---

## 🛠️ Development Workflow

### Start Development Server

```bash
npm run dev
```

Auto-reloads on file changes.

### Make Changes

1. Edit files in `src/`
2. Bot auto-restarts
3. Test in Discord

### Build for Production

```bash
npm run build
```

Creates `dist/` folder with compiled JavaScript.

### Run Production Build

```bash
npm start
```

Runs compiled code from `dist/`.

---

## 📚 Documentation Index

### Quick Reference
- **QUICK_CHECKLIST.md** - Fast setup (30 min)
- **GETTING_STARTED.md** - This file

### Setup Guides
- **SETUP_GUIDE.md** - Detailed step-by-step
- **N8N_WORKFLOW_GUIDE.md** - n8n integration guide
- **sql/README.md** - Database setup

### Technical Docs
- **README.md** - Full project documentation
- **docs/discord-bots/ARCHITECTURE_V3_FINAL.md** - System architecture
- **docs/discord-bots/IMPLEMENTATION_PLAN_V2_N8N.md** - Implementation details

---

## 🎭 Agent Personalities

Your bot can represent different agents by changing `AGENT_NAME` in `.env`:

### Laura (Learning Assistant)
```bash
AGENT_NAME=laura
N8N_WEBHOOK_URL=https://xxx.app.n8n.cloud/webhook/laura
```
- Friendly, patient teacher
- Explains concepts clearly
- Gives examples

### Luka (Code Reviewer)
```bash
AGENT_NAME=luka
N8N_WEBHOOK_URL=https://xxx.app.n8n.cloud/webhook/luka
```
- Professional code reviewer
- Points out bugs and improvements
- Suggests best practices

### Nino (Career Advisor)
```bash
AGENT_NAME=nino
N8N_WEBHOOK_URL=https://xxx.app.n8n.cloud/webhook/nino
```
- Career guidance
- Job search tips
- Industry insights

**For testing**: Start with **Laura only**.

---

## 🔐 Security Notes

### ⚠️ NEVER Commit These Files

- `.env` (contains secrets)
- `node_modules/` (large, reinstallable)
- `dist/` (compiled code, rebuilidable)

These are already in `.gitignore`.

### ✅ Safe to Commit

- `env.example` (template only)
- All `src/` code
- Documentation
- SQL scripts

### 🔒 Protect Your Secrets

- Use strong bot token
- Rotate tokens regularly
- Use webhook authentication for n8n
- Enable SSL for database (already configured)

---

## 🐛 Common Issues

### "Cannot find module discord.js"
→ Run `npm install`

### "Missing required environment variable: DISCORD_BOT_TOKEN"
→ Check `.env` file exists and has correct values

### "Database connection failed"
→ Verify `DATABASE_URL` has `?sslmode=require` at end

### "Bot shows offline in Discord"
→ Check bot token is correct, restart with `npm run dev`

### "Bot doesn't respond"
→ Enable "Message Content Intent" in Discord Developer Portal

### "n8n webhook timeout"
→ Verify workflow is Active (toggle in top right of n8n)

---

## 🎯 Recommended Path

### Day 1: Setup ✅
- [ ] Run through QUICK_CHECKLIST.md
- [ ] Get echo bot working
- [ ] Verify database saves messages
- [ ] Test with 5-10 messages

### Day 2: Basic AI 🤖
- [ ] Read N8N_WORKFLOW_GUIDE.md (Phase 2)
- [ ] Add OpenAI to n8n workflow
- [ ] Test AI responses
- [ ] Verify context is sent to n8n

### Day 3: Context Memory 🧠
- [ ] Implement Phase 3 from N8N_WORKFLOW_GUIDE.md
- [ ] Test multi-turn conversations
- [ ] Verify bot remembers context

### Day 4: RAG Integration 🗄️
- [ ] Implement Phase 4 from N8N_WORKFLOW_GUIDE.md
- [ ] Connect to your course database
- [ ] Test course-specific queries

### Week 2: Production 🚀
- [ ] Deploy to Cloud Run
- [ ] Setup monitoring
- [ ] Add more agents (Luka, Nino)

---

## 💡 Tips

### Development
- Keep `npm run dev` running while coding
- Check terminal logs for errors
- Test each change immediately in Discord

### Testing
- Use a private Discord server for testing
- Create a dedicated test channel
- Keep n8n execution logs open

### Debugging
- Check logs in 3 places:
  1. Terminal (bot logs)
  2. n8n executions
  3. Neon console (database)

### Performance
- Start with `gpt-3.5-turbo` (faster, cheaper)
- Limit context to 10 messages
- Add indexes to database queries

---

## 🚀 Ready to Start?

```bash
# Choose your path:

# Fast path (30 min):
cat QUICK_CHECKLIST.md

# Detailed path (45 min):
cat SETUP_GUIDE.md

# Deep dive (read all docs):
cat README.md
cat N8N_WORKFLOW_GUIDE.md
```

---

## 🤝 Need Help?

1. **Check logs** - Most issues show clear error messages
2. **Review docs** - Step-by-step guides for everything
3. **Test components** - Isolate the problem (Discord? Database? n8n?)
4. **Check examples** - N8N_WORKFLOW_GUIDE.md has code samples

---

**Good luck! 🎉**

You've got a solid foundation. Follow the checklist, and you'll have a working AI Discord bot in 30 minutes! 🚀

