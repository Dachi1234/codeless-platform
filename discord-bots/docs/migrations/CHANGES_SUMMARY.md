# Multi-Bot Update - Changes Summary

## ✅ Code Updated Successfully!

Your Discord bot service now supports **multiple bots** (Laura, Giorgi, Nino, etc.) from a single deployment!

---

## 📁 Files Changed

### Modified Files

1. **`src/config.ts`** - Multi-bot configuration with `SingleBotConfig[]`
2. **`src/bot.ts`** - Accepts bot config, uses bot-specific settings
3. **`src/index.ts`** - Creates and manages multiple bot instances
4. **`src/services/n8n.service.ts`** - Accepts webhook URL per bot
5. **`src/services/database.service.ts`** - Includes `bot_name` in queries
6. **`env.example`** - Shows multi-bot environment variables

### New Files

7. **`sql/003_multi_bot_support.sql`** - Database migration for multi-bot support
8. **`MULTI_BOT_MIGRATION.md`** - Complete guide for deploying Giorgi
9. **`CHANGES_SUMMARY.md`** - This file

---

## 🗃️ Database Changes (Already Applied ✅)

You already ran the SQL migration, which added:

- `bot_name` column to `conversations` table
- `bot_name` column to `messages` table
- Giorgi's profile fields: `tech_respect`, `code_quality`, `current_stack`, `blocker`
- Nino's profile fields (for future): `design_taste`, `ux_understanding`, etc.
- `student_type` field to categorize students
- Indexes for performance

---

## 🎯 What You Can Do Now

### Option 1: Keep Running Laura Only

**No action needed!** The code is backward compatible. Laura will continue working exactly as before.

### Option 2: Add Giorgi (Technical Mentor)

Follow the steps in `MULTI_BOT_MIGRATION.md`:

1. Create Giorgi's Discord bot in Discord Developer Portal
2. Clone Laura's n8n workflow and update it for Giorgi
3. Add Giorgi's secrets to Google Secret Manager
4. Update Cloud Run environment variables
5. Push to Git → Auto-deploy

---

## 🚀 Quick Start for Giorgi

### 1. Discord Setup (5 minutes)

```
1. Go to: https://discord.com/developers/applications
2. Click "New Application" → Name: "Giorgi - Technical Mentor"
3. Bot section → Add Bot → Copy token
4. OAuth2 → URL Generator → Invite to server
```

### 2. n8n Setup (10 minutes)

```
1. Duplicate Laura's workflow
2. Rename to "Giorgi"
3. Update webhook path to /giorgi
4. Change AI Agent prompt (see MULTI_BOT_MIGRATION.md)
5. Update PostgreSQL nodes for Giorgi's fields
```

### 3. Deploy (5 minutes)

```bash
# Store secrets
echo -n "YOUR_GIORGI_TOKEN" | gcloud secrets create GIORGI_BOT_TOKEN --data-file=-
echo -n "https://n8n.../webhook/giorgi" | gcloud secrets create GIORGI_N8N_WEBHOOK_URL --data-file=-

# Update cloudbuild-discord-bot.yaml to reference new secrets

# Push to deploy
git add .
git commit -m "feat: Add Giorgi bot"
git push origin main
```

---

## 📊 Architecture Overview

```
One Cloud Run Service
├── Laura Bot Instance
│   ├── Token: LAURA_BOT_TOKEN
│   ├── Webhook: LAURA_N8N_WEBHOOK_URL
│   └── Tracks: tension_level, trust_level, projects
│
├── Giorgi Bot Instance
│   ├── Token: GIORGI_BOT_TOKEN
│   ├── Webhook: GIORGI_N8N_WEBHOOK_URL
│   └── Tracks: tech_respect, code_quality, stack
│
└── Shared
    ├── Database: Neon PostgreSQL (discord_bots schema)
    ├── Health Check: Port 8080
    └── Logging: Centralized in Cloud Run
```

---

## 🔍 How It Works

### When a user messages Laura:
1. Discord message → Laura bot instance
2. Laura checks: "Is this for me?" (bot ID match)
3. Laura saves to DB with `bot_name='laura'`
4. Laura sends to n8n (laura webhook)
5. n8n responds with PM coaching advice
6. Laura updates `tension_level`, `trust_level`, etc.

### When a user messages Giorgi:
1. Discord message → Giorgi bot instance
2. Giorgi checks: "Is this for me?" (bot ID match)
3. Giorgi saves to DB with `bot_name='giorgi'`
4. Giorgi sends to n8n (giorgi webhook)
5. n8n responds with technical advice
6. Giorgi updates `tech_respect`, `code_quality`, etc.

### Conversation Isolation:
- Laura's conversation with @user in #channel-1 is separate from
- Giorgi's conversation with @user in #channel-1
- Both stored in database with different `bot_name`

### Profile Sharing:
- Student profiles are shared across bots
- Laura sees: `tension_level`, `trust_level`
- Giorgi sees: `tech_respect`, `code_quality`
- Both see: `name`, `cohort`, `notes`

---

## ✅ Backward Compatibility

**Your existing Laura setup will continue working!**

The code checks for:
1. `LAURA_BOT_TOKEN` first
2. Falls back to `DISCORD_BOT_TOKEN` if not found
3. Same for `LAURA_N8N_WEBHOOK_URL` → `N8N_WEBHOOK_URL`

So you don't need to change anything if you want to keep just Laura!

---

## 🎉 Ready to Deploy!

Everything is coded and ready. Choose your path:

**Path A: Keep Laura only** → Do nothing, it already works!

**Path B: Add Giorgi** → Follow `MULTI_BOT_MIGRATION.md`

**Path C: Add Nino later** → Same process, code already supports it!

---

## 📞 Need Help?

Check the logs:
```bash
gcloud run services logs read discord-bot-multi --region=us-central1 --limit=100
```

Test health check:
```bash
curl https://your-service.run.app/health
```

Should return:
```json
{
  "status": "running",
  "bots": ["laura"],  // or ["laura", "giorgi"]
  "timestamp": "2025-10-29T..."
}
```

---

**You're all set!** 🚀

