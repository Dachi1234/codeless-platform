# Discord Bot Quick Start Checklist ✅

Follow these steps in order. Check each box as you complete it.

---

## ✅ Step 1: Database Setup (5 minutes)

- [ ] Open [Neon Console](https://console.neon.tech)
- [ ] Go to SQL Editor
- [ ] Copy contents of `discord-bots/sql/001_discord_schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Verify: Run `SELECT tablename FROM pg_tables WHERE schemaname = 'discord_bots';`
- [ ] You should see: `conversations`, `messages`, `student_profiles`
- [ ] Copy your database connection string (starts with `postgresql://...`)

**✅ Database ready!**

---

## ✅ Step 2: Create Discord Bot (10 minutes)

- [ ] Go to [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Click **"New Application"** → Name it `Laura` → Create
- [ ] Go to **"Bot"** tab → Click **"Add Bot"**
- [ ] Enable **"Message Content Intent"** (REQUIRED!)
- [ ] Click **"Save Changes"**
- [ ] Click **"Reset Token"** → Copy the token (save securely!)
- [ ] Go to **"OAuth2"** → **"URL Generator"**
- [ ] Select scopes: `bot`
- [ ] Select permissions: `Read Messages`, `Send Messages`, `Read Message History`
- [ ] Copy generated URL → Open in browser → Invite to your test server
- [ ] Verify bot appears in server member list (offline is OK for now)

**✅ Discord bot created!**

---

## ✅ Step 3: Create n8n Workflow (5 minutes)

- [ ] Go to [n8n Cloud](https://app.n8n.cloud)
- [ ] Create new workflow → Name it `Laura Agent`
- [ ] Add **Webhook** node
  - HTTP Method: `POST`
  - Path: `laura`
  - Respond: `When Last Node Finishes`
- [ ] Copy the **Production URL** (e.g., `https://xxx.app.n8n.cloud/webhook/laura`)
- [ ] Add **Code** node (for testing):
  ```javascript
  const message = $json.message;
  const username = $json.username;
  return {
    response: `Hello ${username}! You said: "${message}". I'm Laura! (test response)`
  };
  ```
- [ ] Add **Respond to Webhook** node
  - Respond With: `JSON`
  - Response Body: `{{ $json }}`
- [ ] Connect: Webhook → Code → Respond
- [ ] Toggle **"Active"** in top right (turn it ON)
- [ ] Verify workflow shows as "Active"

**✅ n8n workflow ready!**

---

## ✅ Step 4: Configure Discord Bot (5 minutes)

- [ ] Open terminal in `discord-bots/` folder
- [ ] Run: `cp env.example .env`
- [ ] Open `.env` file
- [ ] Fill in:
  ```bash
  DISCORD_BOT_TOKEN=<from Step 2>
  DATABASE_URL=<from Step 1>
  N8N_WEBHOOK_URL=<from Step 3>
  AGENT_NAME=laura
  ```
- [ ] Save file
- [ ] Verify all 3 secrets are filled in (no `your_xxx_here` placeholders)

**✅ Configuration complete!**

---

## ✅ Step 5: Run the Bot (5 minutes)

- [ ] In terminal: `npm install` (wait ~30 seconds)
- [ ] Run: `npm run dev`
- [ ] You should see:
  ```
  ✅ Bot logged in as: Laura#1234
  🎭 Agent: LAURA
  ✅ Database connected
  ✅ n8n webhook test successful
  ```
- [ ] If you see errors, check:
  - Bot token is correct
  - Database URL is correct
  - n8n workflow is active

**✅ Bot is running!**

---

## ✅ Step 6: Test the Bot (2 minutes)

- [ ] Go to Discord server where you invited the bot
- [ ] Verify bot shows as **online** (green circle)
- [ ] Send message: `Hello Laura!`
- [ ] Bot should show "typing..." indicator
- [ ] Bot should reply with test message
- [ ] Check terminal logs for success messages
- [ ] Send another message to test conversation history

**🎉 Bot is working!**

---

## 🎯 Next Steps

Once basic bot works:

- [ ] Read `N8N_WORKFLOW_GUIDE.md` for AI integration
- [ ] Add OpenAI node to n8n workflow
- [ ] Test conversation memory
- [ ] Add database querying (RAG)
- [ ] Deploy to Cloud Run (see `DEPLOYMENT.md`)

---

## 🐛 Troubleshooting

### Bot shows offline
→ Check bot token is correct, restart bot with `npm run dev`

### Bot doesn't respond
→ Verify "Message Content Intent" is enabled in Discord Developer Portal

### Database errors
→ Check connection string has `?sslmode=require` at end

### n8n timeout
→ Verify workflow is Active (toggle in n8n top right)

### Bot replies with error message
→ Check n8n execution logs for errors

---

## 📚 Documentation

- **Setup Guide**: `SETUP_GUIDE.md` - Detailed step-by-step
- **n8n Workflows**: `N8N_WORKFLOW_GUIDE.md` - AI integration guide
- **Architecture**: `docs/discord-bots/ARCHITECTURE_V3_FINAL.md`
- **Implementation**: `docs/discord-bots/IMPLEMENTATION_PLAN_V2_N8N.md`

---

**Total Time**: ~30 minutes 🚀

Good luck! 🎉

