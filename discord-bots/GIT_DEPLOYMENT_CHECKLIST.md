# Discord Bot - Git Deployment Checklist

## 🎯 Goal
Deploy Discord bot to Cloud Run via Git push (just like backend)

---

## ✅ Step-by-Step Checklist

### Prerequisites (One-Time Setup)

- [ ] **1. Create Discord Bot** (Discord Developer Portal)
  - Get bot token
  - Enable "Message Content Intent"
  - Invite to server

- [ ] **2. Create n8n Webhook** (n8n Cloud)
  - Create workflow
  - Add webhook node
  - Get webhook URL

- [ ] **3. Run Database Schema** (Neon Console)
  - Open SQL Editor
  - Run `sql/001_discord_schema.sql`
  - Verify tables created

---

### Cloud Setup (One-Time)

- [ ] **4. Create Secrets in Google Secret Manager**

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable API
gcloud services enable secretmanager.googleapis.com

# Create Discord bot token secret
echo -n "YOUR_DISCORD_BOT_TOKEN_HERE" | gcloud secrets create DISCORD_BOT_TOKEN --data-file=-

# Create database URL secret
echo -n "postgresql://user:pass@ep-xxx.neon.tech:5432/codeless_db?sslmode=require" | gcloud secrets create DISCORD_DATABASE_URL --data-file=-

# Create n8n webhook URL secret
echo -n "https://your-n8n.app.n8n.cloud/webhook/laura" | gcloud secrets create N8N_WEBHOOK_URL --data-file=-
```

- [ ] **5. Grant Cloud Run Access to Secrets**

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# Grant access to each secret
gcloud secrets add-iam-policy-binding DISCORD_BOT_TOKEN \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding DISCORD_DATABASE_URL \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding N8N_WEBHOOK_URL \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

- [ ] **6. Update Backend Trigger** (Cloud Build Console)
  - Go to: https://console.cloud.google.com/cloud-build/triggers
  - Edit existing trigger
  - Add `Included files filter: backend/**`
  - Save

- [ ] **7. Create Discord Bot Trigger** (Cloud Build Console)
  - Click "CREATE TRIGGER"
  - Name: `discord-bot-deployment`
  - Event: Push to branch
  - Branch: `^main$`
  - Included files filter: `discord-bots/**`
  - Cloud Build config: `cloudbuild-discord-bot.yaml`
  - Create

---

### Deploy (Every Time You Update Code)

- [ ] **8. Commit and Push**

```bash
cd discord-bots/
git add .
git commit -m "Deploy Discord bot"
git push origin main
```

- [ ] **9. Monitor Build**
  - Go to: https://console.cloud.google.com/cloud-build/builds
  - Watch `discord-bot-deployment` trigger
  - Wait ~5-10 minutes

- [ ] **10. Check Deployment**
  - Go to: https://console.cloud.google.com/run
  - Find `discord-bot-laura` service
  - Click → Logs tab
  - Look for: `✅ Bot logged in as: Laura#1234`

- [ ] **11. Test in Discord**
  - Bot should show as online
  - Send message: `Hello Laura!`
  - Bot should reply

---

## 🎉 Success Indicators

You'll know it worked when you see:

### In Cloud Build Logs:
```
Step #3 - "Deploy to Cloud Run": Service [discord-bot-laura] revision [xxx] has been deployed
```

### In Cloud Run Logs:
```
✅ Bot logged in as: Laura#1234
🎭 Agent: LAURA
✅ Database connected
✅ n8n webhook test successful
```

### In Discord:
- Bot shows online (green circle)
- Responds to messages

---

## 🔄 Update Workflow

After initial deployment, to update the bot:

```bash
# 1. Make changes in discord-bots/
# 2. Commit and push
git add discord-bots/
git commit -m "Updated Discord bot logic"
git push origin main

# 3. Auto-deploys via Cloud Build!
```

**No manual commands needed!** 🎉

---

## 🐛 Troubleshooting

### Build fails with "secret not found"
→ Make sure you created secrets (Step 4-5)

### Build succeeds but bot offline
→ Check Cloud Run logs for errors
→ Verify Discord token is correct
→ Check "Message Content Intent" is enabled

### Trigger doesn't run
→ Verify `Included files filter: discord-bots/**` is set
→ Check you pushed changes to `main` branch

### "Permission denied" on secrets
→ Run Step 5 commands to grant access

---

## 📚 More Info

- **Full Setup**: See `CLOUD_BUILD_TRIGGERS_SETUP.md`
- **Architecture**: See `docs/discord-bots/ARCHITECTURE_V3_FINAL.md`
- **Neon Connection**: See `NEON_CONNECTION_GUIDE.md`

---

**Time to complete**: ~20 minutes for one-time setup, then instant deployments! 🚀

