# Multi-Bot Migration Guide

## ✅ What Was Done

The Discord bot service has been updated to support **multiple bots** (Laura, Giorgi, Nino, etc.) running from a single Cloud Run service.

### Code Changes

1. **`src/config.ts`**
   - Changed from single `BotConfig` to `AppConfig` with array of bots
   - Added `SingleBotConfig` interface for individual bot settings
   - Added `parseBotsConfig()` function to load multiple bots from environment variables
   - Supports backward compatibility with old env vars (`DISCORD_BOT_TOKEN`, `N8N_WEBHOOK_URL`)

2. **`src/bot.ts`**
   - Updated constructor to accept `SingleBotConfig` parameter
   - Changed `agentName` to `botName` throughout
   - Updated database calls to include `botName` parameter
   - Updated to use bot-specific `token`, `maxContextMessages`, `responseTimeout`

3. **`src/index.ts`**
   - Creates multiple bot instances from `config.bots` array
   - Starts all bots concurrently with `Promise.all()`
   - Updated health check to return JSON with list of active bots
   - Gracefully shuts down all bots

4. **`src/services/n8n.service.ts`**
   - Updated constructor to accept `webhookUrl` and `timeout` parameters
   - Each bot now has its own n8n webhook URL

5. **`src/services/database.service.ts`**
   - Added `botName` parameter to `getOrCreateConversation()`
   - Added `botName` parameter to `saveMessage()`
   - Updated queries to include `bot_name` in WHERE and INSERT clauses

6. **`sql/003_multi_bot_support.sql`**
   - Adds `bot_name` column to `conversations` and `messages` tables
   - Adds Giorgi-specific profile fields (`tech_respect`, `code_quality`, `current_stack`, `blocker`)
   - Adds Nino-specific profile fields (for future use)
   - Creates indexes for performance
   - Backfills existing data with `bot_name = 'laura'`

7. **`env.example`**
   - Updated to show multi-bot configuration
   - Separate env vars for Laura, Giorgi, and Nino
   - Maintains backward compatibility

---

## 🚀 Next Steps

### 1. Create Giorgi's Discord Bot Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it **"Giorgi - Technical Mentor"**
4. Go to **Bot** section
5. Click **"Add Bot"**
6. **Copy the Bot Token** → You'll need this for `GIORGI_BOT_TOKEN`
7. **Copy the Application ID** → You'll need this for `GIORGI_CLIENT_ID`
8. Enable **Message Content Intent**
9. Go to **OAuth2 → URL Generator**:
   - Select scopes: `bot`
   - Select permissions: `Send Messages`, `Read Message History`, `Read Messages/View Channels`
   - Copy the URL and invite the bot to your Discord server

### 2. Create Giorgi's n8n Workflow

1. Go to your n8n Cloud instance
2. **Duplicate Laura's workflow** (easier than starting from scratch)
3. Rename it to **"Giorgi - Technical Mentor"**
4. Update the **Webhook node**:
   - Change path to `/giorgi` or create new webhook
   - Copy the webhook URL → You'll need this for `GIORGI_N8N_WEBHOOK_URL`
5. Update the **AI Agent** system prompt:
   ```
   You are Giorgi, a senior technical mentor for developers. You help students with code quality, technical decisions, architecture, and debugging. You track:
   - tech_respect: How much the student respects technical decisions (1-10)
   - code_quality: Assessment of their code quality (1-10)
   - current_stack: Technologies they're working with
   - blocker: Current technical challenge they're facing
   
   Be direct, technical, and solution-oriented. Ask probing questions about their technical approach.
   ```
6. Update the **PostgreSQL nodes** to work with Giorgi's profile fields:
   - Replace `tension_level`, `trust_level` with `tech_respect`, `code_quality`
   - Replace `current_project` with `current_stack`
   - Add `blocker` field
7. Test the workflow

### 3. Update Cloud Run Environment Variables

You have two options:

#### Option A: Update via Google Cloud Console

1. Go to [Cloud Run](https://console.cloud.google.com/run)
2. Click on your `discord-bot-laura` service
3. Click **"Edit & Deploy New Revision"**
4. Add these environment variables:
   ```
   GIORGI_BOT_TOKEN=<your_giorgi_bot_token>
   GIORGI_CLIENT_ID=<your_giorgi_client_id>
   GIORGI_N8N_WEBHOOK_URL=<your_giorgi_webhook_url>
   GIORGI_MAX_CONTEXT_MESSAGES=10
   GIORGI_RESPONSE_TIMEOUT=120000
   ```
5. Click **"Deploy"**

#### Option B: Update via Cloud Build (Recommended)

Update `cloudbuild-discord-bot.yaml`:

```yaml
- name: 'gcr.io/cloud-builders/gcloud'
  args:
    - 'run'
    - 'deploy'
    - 'discord-bot-multi'
    - '--image=gcr.io/$PROJECT_ID/discord-bot:$SHORT_SHA'
    - '--region=us-central1'
    - '--platform=managed'
    - '--allow-unauthenticated'
    - '--set-env-vars=AGENT_NAME=multi,MAX_CONTEXT_MESSAGES=10,LOG_LEVEL=info,AGENT_RESPONSE_TIMEOUT=120000'
    - '--set-secrets=DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN:latest,LAURA_BOT_TOKEN=LAURA_BOT_TOKEN:latest,GIORGI_BOT_TOKEN=GIORGI_BOT_TOKEN:latest,DATABASE_URL=DISCORD_DATABASE_URL:latest,N8N_WEBHOOK_URL=N8N_WEBHOOK_URL:latest,LAURA_N8N_WEBHOOK_URL=LAURA_N8N_WEBHOOK_URL:latest,GIORGI_N8N_WEBHOOK_URL=GIORGI_N8N_WEBHOOK_URL:latest'
    - '--min-instances=1'
    - '--max-instances=10'
    - '--memory=512Mi'
    - '--cpu=1'
    - '--timeout=300'
```

### 4. Create Google Secrets

```bash
# Giorgi's bot token
echo -n "YOUR_GIORGI_BOT_TOKEN" | gcloud secrets create GIORGI_BOT_TOKEN --data-file=-

# Giorgi's n8n webhook URL
echo -n "https://your-n8n.app.n8n.cloud/webhook/giorgi" | gcloud secrets create GIORGI_N8N_WEBHOOK_URL --data-file=-

# Laura's webhook URL (if updating)
echo -n "https://your-n8n.app.n8n.cloud/webhook/laura" | gcloud secrets create LAURA_N8N_WEBHOOK_URL --data-file=-

# Laura's bot token (if updating)
echo -n "YOUR_LAURA_BOT_TOKEN" | gcloud secrets create LAURA_BOT_TOKEN --data-file=-
```

**Important:** Use `echo -n` to avoid newline characters!

### 5. Deploy to Cloud Run

```bash
cd discord-bots
git add .
git commit -m "feat: Add multi-bot support (Laura + Giorgi)"
git push origin main
```

Cloud Build will automatically:
1. Build the new Docker image
2. Deploy to Cloud Run
3. Start both Laura and Giorgi bots

### 6. Verify Deployment

1. Check Cloud Run logs:
   ```bash
   gcloud run services logs read discord-bot-multi --region=us-central1 --limit=50
   ```

2. Look for:
   ```
   🚀 Initializing Multi-Bot Discord Service...
   📊 Configured bots: laura, giorgi
   🤖 Creating bot instance: laura
   🤖 Creating bot instance: giorgi
   🚀 Starting 2 bot(s)...
   ✅ All 2 bot(s) are now online!
   ```

3. Test in Discord:
   - Mention `@Laura` → should get PM mentor response
   - Mention `@Giorgi` → should get technical mentor response

4. Check health endpoint:
   ```bash
   curl https://your-cloud-run-url.run.app/health
   ```
   Should return:
   ```json
   {
     "status": "running",
     "bots": ["laura", "giorgi"],
     "timestamp": "2025-10-29T..."
   }
   ```

---

## 📊 Database Changes

The SQL migration adds:

### New Columns in `conversations`
- `bot_name` - Which bot owns this conversation

### New Columns in `messages`
- `bot_name` - Which bot sent/received this message

### New Columns in `student_profiles`
- `tech_respect` - For Giorgi (1-10)
- `code_quality` - For Giorgi (1-10)
- `current_stack` - For Giorgi (e.g., "React, Node.js, PostgreSQL")
- `blocker` - For Giorgi (current technical challenge)
- `student_type` - Type of student ('developer', 'designer', 'pm', etc.)
- `design_taste` - For Nino (future)
- `ux_understanding` - For Nino (future)
- `current_mockup` - For Nino (future)
- `feedback_notes` - For Nino (future)

---

## 🎯 Benefits of This Architecture

✅ **Single Deployment** - One Cloud Run service for all bots
✅ **Shared Infrastructure** - One database, one deployment pipeline
✅ **Easy to Scale** - Add new bots by just adding env vars
✅ **Cost Effective** - No duplicate services
✅ **Centralized Monitoring** - All logs in one place
✅ **Bot-Specific Context** - Each bot has its own conversation history
✅ **Backward Compatible** - Works with existing Laura setup

---

## 🔄 Adding More Bots (e.g., Nino)

1. Create Discord bot application
2. Create n8n workflow
3. Add to Google Secrets:
   ```bash
   echo -n "NINO_BOT_TOKEN" | gcloud secrets create NINO_BOT_TOKEN --data-file=-
   echo -n "https://n8n.../webhook/nino" | gcloud secrets create NINO_N8N_WEBHOOK_URL --data-file=-
   ```
4. Update `cloudbuild-discord-bot.yaml` to include Nino secrets
5. Push to Git
6. Done! The code already supports it.

---

## 🐛 Troubleshooting

### Bot doesn't start
- Check Cloud Run logs: `gcloud run services logs read discord-bot-multi --region=us-central1`
- Verify secrets are correct: `gcloud secrets versions access latest --secret=GIORGI_BOT_TOKEN`
- Check that Discord tokens don't have newlines

### Database errors
- Verify you ran `003_multi_bot_support.sql`
- Check connection string doesn't have extra characters
- Verify `bot_name` column exists: `SELECT * FROM discord_bots.conversations LIMIT 1;`

### n8n not responding
- Test webhook manually: `curl -X POST https://your-n8n.../webhook/giorgi -H "Content-Type: application/json" -d '{"message":"test"}'`
- Check n8n workflow is active
- Verify webhook URL is correct

---

## 📝 Notes

- Laura continues to work exactly as before (backward compatible)
- Each bot maintains separate conversation histories per channel
- Student profiles are shared across all bots (same database table)
- Each bot tracks different fields in the profile (Laura: tension/trust, Giorgi: tech_respect/code_quality)

---

**Ready to deploy Giorgi!** 🚀

