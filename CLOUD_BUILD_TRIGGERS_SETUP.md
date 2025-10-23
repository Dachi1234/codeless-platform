# Cloud Build Triggers Setup

## 🎯 Goal

Have **2 separate Cloud Run services** in **1 git repo**:
- `codeless-backend` → Deploys when `backend/**` changes
- `discord-bot-laura` → Deploys when `discord-bots/**` changes

---

## 📁 Build Configuration Files

✅ **You have:**
- `cloudbuild.yaml` → Backend deployment
- `cloudbuild-discord-bot.yaml` → Discord bot deployment

---

## 🔧 Setup Cloud Build Triggers

### Step 1: Go to Cloud Build Triggers

1. Open Google Cloud Console
2. Go to **Cloud Build** → **Triggers**
3. URL: `https://console.cloud.google.com/cloud-build/triggers`

---

### Step 2: Update Existing Backend Trigger

You probably already have a trigger for your backend. Let's update it:

1. **Find** your existing trigger (probably named something like "main-push" or "codeless-backend")
2. **Click** to edit it
3. **Update these settings:**

| Setting | Value |
|---------|-------|
| **Name** | `backend-deployment` |
| **Event** | Push to a branch |
| **Source** | Your repo (already connected) |
| **Branch** | `^main$` |
| **Included files filter** | `backend/**` |
| **Cloud Build configuration file** | `cloudbuild.yaml` |

4. **Save**

Now this trigger will **only run when `backend/` files change**.

---

### Step 3: Create Discord Bot Trigger

1. **Click** "CREATE TRIGGER"
2. **Fill in:**

| Setting | Value |
|---------|-------|
| **Name** | `discord-bot-deployment` |
| **Event** | Push to a branch |
| **Source** | Your repo (same as backend) |
| **Branch** | `^main$` |
| **Included files filter** | `discord-bots/**` |
| **Cloud Build configuration file** | `cloudbuild-discord-bot.yaml` |

3. **Click** "CREATE"

Now this trigger will **only run when `discord-bots/` files change**.

---

## ⚙️ Before First Deployment: Create Secrets

The Discord bot needs secrets. Create them **once** before first deploy:

```bash
# Enable Secret Manager
gcloud services enable secretmanager.googleapis.com

# Create secrets (replace with your actual values)
echo -n "YOUR_DISCORD_BOT_TOKEN" | gcloud secrets create DISCORD_BOT_TOKEN --data-file=-
echo -n "postgresql://user:pass@ep-xxx.neon.tech:5432/codeless_db?sslmode=require" | gcloud secrets create DISCORD_DATABASE_URL --data-file=-
echo -n "https://your-n8n.app.n8n.cloud/webhook/laura" | gcloud secrets create N8N_WEBHOOK_URL --data-file=-

# Get project number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# Grant Cloud Run access to secrets
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

**Important:** Do this **before** pushing Discord bot code!

---

## 🚀 How It Works

### Scenario 1: You change backend code

```bash
# Edit backend files
git add backend/
git commit -m "Updated backend API"
git push origin main
```

**Result:**
- ✅ `backend-deployment` trigger runs (because `backend/**` changed)
- ✅ Uses `cloudbuild.yaml`
- ✅ Deploys `codeless-backend` service
- ❌ Discord bot trigger does NOT run

---

### Scenario 2: You change Discord bot code

```bash
# Edit Discord bot files
git add discord-bots/
git commit -m "Updated Discord bot"
git push origin main
```

**Result:**
- ✅ `discord-bot-deployment` trigger runs (because `discord-bots/**` changed)
- ✅ Uses `cloudbuild-discord-bot.yaml`
- ✅ Deploys `discord-bot-laura` service
- ❌ Backend trigger does NOT run

---

### Scenario 3: You change both

```bash
# Edit both
git add backend/ discord-bots/
git commit -m "Updated both services"
git push origin main
```

**Result:**
- ✅ BOTH triggers run in parallel
- ✅ Backend deploys to `codeless-backend`
- ✅ Discord bot deploys to `discord-bot-laura`

---

## ✅ Summary

| Trigger | Watches | Uses | Deploys |
|---------|---------|------|---------|
| `backend-deployment` | `backend/**` | `cloudbuild.yaml` | `codeless-backend` |
| `discord-bot-deployment` | `discord-bots/**` | `cloudbuild-discord-bot.yaml` | `discord-bot-laura` |

**Cloud Run services are completely separate!** ✅

---

## 🎯 Next Steps

### 1. Create Secrets (One-time)
Run the commands above to create Discord bot secrets.

### 2. Update Backend Trigger
Add `Included files filter: backend/**` to your existing trigger.

### 3. Create Discord Bot Trigger
Follow Step 3 above.

### 4. Test It!
```bash
cd discord-bots/
# Make a small change (like add a comment)
git add .
git commit -m "Test Discord bot deployment"
git push origin main
```

Check Cloud Build logs - only Discord bot should deploy!

---

## 🔍 Monitoring

### View Triggers
```
https://console.cloud.google.com/cloud-build/triggers
```

### View Build History
```
https://console.cloud.google.com/cloud-build/builds
```

### View Cloud Run Services
```
https://console.cloud.google.com/run
```

You should see:
- `codeless-backend` (your platform)
- `discord-bot-laura` (your bot)

---

## 🐛 Troubleshooting

### Both triggers run when I change backend
→ Make sure backend trigger has `Included files filter: backend/**`

### Discord bot trigger doesn't run
→ Check `Included files filter: discord-bots/**` is set correctly

### Discord bot deployment fails with "secret not found"
→ Create the secrets first (see above)

### "Permission denied" on secrets
→ Run the `gcloud secrets add-iam-policy-binding` commands

---

## 💰 Cost

Each Cloud Run service bills separately:
- **Backend**: Based on requests (likely free tier)
- **Discord Bot**: ~$7/month (24/7 with `min-instances=1`)

**Total**: ~$7/month extra for Discord bot

---

**Ready?** Create the secrets, then push your Discord bot code! 🚀

