# Discord Bot Setup Guide

Complete step-by-step guide to create and configure your Discord bot.

---

## 📋 Table of Contents

1. [Create Discord Bot](#1-create-discord-bot)
2. [Setup Database](#2-setup-database)
3. [Create n8n Workflow](#3-create-n8n-workflow)
4. [Configure Environment](#4-configure-environment)
5. [Run the Bot](#5-run-the-bot)

---

## 1. Create Discord Bot

### Step 1.1: Go to Discord Developer Portal

Visit: **https://discord.com/developers/applications**

### Step 1.2: Create New Application

1. Click **"New Application"**
2. Name it: `Laura` (or your agent name)
3. Click **"Create"**

### Step 1.3: Create Bot

1. Go to **"Bot"** tab in left sidebar
2. Click **"Add Bot"**
3. Confirm by clicking **"Yes, do it!"**

### Step 1.4: Configure Bot Settings

Enable these **Privileged Gateway Intents**:

- ✅ **Message Content Intent** (REQUIRED!)
- ✅ **Server Members Intent** (Optional)
- ✅ **Presence Intent** (Optional)

Click **"Save Changes"**

### Step 1.5: Get Bot Token

1. Click **"Reset Token"** (if it's your first time, just "Copy")
2. Click **"Copy"** to copy your bot token
3. **⚠️ SAVE THIS TOKEN SECURELY** - you'll need it for `.env`

### Step 1.6: Invite Bot to Server

1. Go to **"OAuth2"** → **"URL Generator"** tab
2. Select scopes:
   - ✅ `bot`
3. Select bot permissions:
   - ✅ `Read Messages/View Channels`
   - ✅ `Send Messages`
   - ✅ `Read Message History`
   - ✅ `Add Reactions` (optional)
4. Copy the generated URL
5. Open URL in browser
6. Select your server
7. Click **"Authorize"**

✅ **Bot is now in your server!**

---

## 2. Setup Database

### Step 2.1: Open Neon Console

Go to: **https://console.neon.tech**

### Step 2.2: Select Your Project

Choose your existing project that hosts your platform database.

### Step 2.3: Open SQL Editor

Click **"SQL Editor"** in the left sidebar.

### Step 2.4: Run Schema Script

1. Open file: `discord-bots/sql/001_discord_schema.sql`
2. Copy **entire contents**
3. Paste into Neon SQL Editor
4. Click **"Run"**

### Step 2.5: Verify Tables Created

Run this query:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'discord_bots';
```

You should see:
- `conversations`
- `messages`
- `student_profiles`

### Step 2.6: Get Database Connection String

1. Go to **"Dashboard"** in Neon
2. Find **"Connection string"**
3. Copy the PostgreSQL connection string
4. It should look like:
   ```
   postgresql://user:password@ep-xxx.neon.tech:5432/codeless_db?sslmode=require
   ```

✅ **Database is ready!**

---

## 3. Create n8n Workflow

### Step 3.1: Login to n8n Cloud

Go to: **https://app.n8n.cloud** (or your n8n instance)

### Step 3.2: Create New Workflow

1. Click **"Create Workflow"**
2. Name it: `Laura Agent`

### Step 3.3: Add Webhook Trigger

1. Click **"+"** to add node
2. Search for **"Webhook"**
3. Select **"Webhook"**
4. Configure:
   - **HTTP Method**: `POST`
   - **Path**: `laura` (or your agent name)
   - **Respond**: `Immediately`
5. Copy the **Production URL** (you'll need this for `.env`)
   - Example: `https://your-instance.app.n8n.cloud/webhook/laura`

### Step 3.4: Add OpenAI Node (Simple Version)

For now, let's create a **simple echo workflow** for testing:

1. Add **"Code"** node
2. Connect it to the Webhook
3. Paste this code:

```javascript
// Simple echo response for testing
const incomingMessage = $json.message;
const username = $json.username;

return {
  response: `Hello ${username}! You said: "${incomingMessage}". I'm Laura, your AI teaching assistant! (This is a test response)`
};
```

4. Add **"Respond to Webhook"** node
5. Connect Code node to it
6. Configure:
   - **Respond With**: `JSON`
   - **Response Body**: `{{ $json }}`

### Step 3.5: Activate Workflow

Click **"Active"** toggle in top right → Turn it **ON**

✅ **n8n webhook is live!**

---

## 4. Configure Environment

### Step 4.1: Create .env File

```bash
cd discord-bots/
cp env.example .env
```

### Step 4.2: Edit .env File

Open `.env` and fill in your credentials:

```bash
# From Discord Developer Portal (Step 1.5)
DISCORD_BOT_TOKEN=your_bot_token_here

# From Neon Console (Step 2.6)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech:5432/codeless_db?sslmode=require

# From n8n Workflow (Step 3.3)
N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/laura

# Agent Configuration
AGENT_NAME=laura
MAX_CONTEXT_MESSAGES=10
AGENT_RESPONSE_TIMEOUT=30000

# Logging
LOG_LEVEL=info
DEBUG=false
```

### Step 4.3: Verify Configuration

Check that:
- ✅ `DISCORD_BOT_TOKEN` starts with a long string of characters
- ✅ `DATABASE_URL` contains `@ep-` (Neon endpoint)
- ✅ `N8N_WEBHOOK_URL` is a valid HTTPS URL
- ✅ `AGENT_NAME` matches your agent (laura, luka, nino)

✅ **Configuration complete!**

---

## 5. Run the Bot

### Step 5.1: Install Dependencies

```bash
npm install
```

Wait for all packages to install (~30 seconds).

### Step 5.2: Start Development Mode

```bash
npm run dev
```

### Step 5.3: Check Logs

You should see:

```
🚀 Starting Discord bot...
✅ Bot logged in as: Laura#1234
🎭 Agent: LAURA
📊 Serving 1 servers
✅ Database connected: 2025-10-23T10:00:00.000Z
🔗 Testing n8n webhook connection...
✅ n8n webhook test successful: 200
```

### Step 5.4: Test the Bot

1. Go to your Discord server
2. Find the bot in the member list (should show as online)
3. Send a message in any channel (or DM the bot)
4. Example: `Hello Laura!`

### Step 5.5: Verify Response

The bot should:
1. Show "typing..." indicator
2. Reply with your test message from n8n
3. Logs should show:

```
💬 Message from YourName#1234:
   Channel: 1234567890 (GUILD_TEXT)
   Content: Hello Laura!
📤 Sending to n8n (laura): ...
📥 Received from n8n: ...
✅ Response sent successfully
```

✅ **Bot is working!**

---

## 🎉 Success!

Your Discord bot is now:
- ✅ Connected to Discord
- ✅ Saving conversations to database
- ✅ Sending messages to n8n
- ✅ Responding to users

---

## 🔧 Next Steps

### 1. Enhance n8n Workflow

Replace the simple echo with actual AI logic:
- Add OpenAI node
- Add conversation memory
- Add RAG for course content

### 2. Test Conversation History

Send multiple messages and verify context is maintained.

### 3. Deploy to Production

See `DEPLOYMENT.md` for Cloud Run deployment guide.

### 4. Add More Agents

Create separate workflows and bots for Luka and Nino.

---

## 🐛 Troubleshooting

### Bot Shows Offline

- Check `DISCORD_BOT_TOKEN` is correct
- Verify bot was invited to server
- Check logs for connection errors

### No Response from Bot

- Verify **Message Content Intent** is enabled
- Check bot has permission to read/send messages
- Look for errors in console logs

### Database Errors

- Verify `DATABASE_URL` is correct
- Ensure schema was created (Step 2.4)
- Check Neon console for connection issues

### n8n Not Responding

- Verify workflow is **Active** (toggle in top right)
- Test webhook URL in browser (should return error, but proves it's reachable)
- Check n8n execution logs

---

## 📚 Additional Resources

- [Discord.js Guide](https://discordjs.guide/)
- [n8n Documentation](https://docs.n8n.io/)
- [Neon Documentation](https://neon.tech/docs/introduction)

---

Need help? Check the logs first - they're very detailed! 🚀

