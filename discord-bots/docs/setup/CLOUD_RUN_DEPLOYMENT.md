# Discord Bot - Cloud Run Deployment Guide

## 🎯 Overview

Deploy your Discord bot to Google Cloud Run for 24/7 operation.

---

## 📋 Prerequisites

- ✅ Google Cloud Project (same one as your backend)
- ✅ gcloud CLI installed
- ✅ Docker installed (for local testing)
- ✅ Bot working locally (`npm run dev`)

---

## 🚀 Manual Deployment (First Time)

### Step 1: Build Docker Image Locally (Optional - Test First)

```bash
cd discord-bots/

# Build the image
docker build -t discord-bot-laura .

# Test locally (make sure you have .env file)
docker run --env-file .env discord-bot-laura
```

Press `Ctrl+C` to stop when confirmed working.

---

### Step 2: Set Your Google Cloud Project

```bash
# List your projects
gcloud projects list

# Set your project (use the PROJECT_ID from your backend)
gcloud config set project YOUR_PROJECT_ID

# Example:
# gcloud config set project codeless-platform-12345
```

---

### Step 3: Enable Required APIs

```bash
# Enable Cloud Run API (if not already enabled)
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

---

### Step 4: Build and Push to Google Container Registry

```bash
cd discord-bots/

# Build and push in one command (using Cloud Build)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/discord-bot-laura

# Example:
# gcloud builds submit --tag gcr.io/codeless-platform-12345/discord-bot-laura
```

This will:
- ✅ Build your Docker image in the cloud
- ✅ Push to Google Container Registry
- ⏳ Takes ~2-3 minutes

---

### Step 5: Deploy to Cloud Run

```bash
gcloud run deploy discord-bot-laura \
  --image gcr.io/YOUR_PROJECT_ID/discord-bot-laura \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "AGENT_NAME=laura,MAX_CONTEXT_MESSAGES=10,LOG_LEVEL=info" \
  --set-secrets "DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN:latest,DATABASE_URL=DISCORD_DATABASE_URL:latest,N8N_WEBHOOK_URL=N8N_WEBHOOK_URL:latest"
```

**Wait!** Before running this, you need to create secrets first (Step 6).

---

### Step 6: Create Secrets in Google Secret Manager

#### Enable Secret Manager API

```bash
gcloud services enable secretmanager.googleapis.com
```

#### Create Secrets

```bash
# Discord Bot Token
echo -n "YOUR_DISCORD_BOT_TOKEN" | gcloud secrets create DISCORD_BOT_TOKEN --data-file=-

# Database URL
echo -n "YOUR_NEON_DATABASE_URL" | gcloud secrets create DISCORD_DATABASE_URL --data-file=-

# n8n Webhook URL
echo -n "YOUR_N8N_WEBHOOK_URL" | gcloud secrets create N8N_WEBHOOK_URL --data-file=-
```

**Replace the values** with your actual credentials!

#### Grant Access to Cloud Run

```bash
# Get your project number
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

---

### Step 7: Deploy to Cloud Run (For Real This Time)

```bash
gcloud run deploy discord-bot-laura \
  --image gcr.io/YOUR_PROJECT_ID/discord-bot-laura \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --cpu=1 \
  --memory=512Mi \
  --min-instances=1 \
  --max-instances=1 \
  --set-env-vars "AGENT_NAME=laura,MAX_CONTEXT_MESSAGES=10,LOG_LEVEL=info,AGENT_RESPONSE_TIMEOUT=30000" \
  --set-secrets "DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN:latest,DATABASE_URL=DISCORD_DATABASE_URL:latest,N8N_WEBHOOK_URL=N8N_WEBHOOK_URL:latest"
```

**Important Flags:**
- `--min-instances=1` - Keeps bot running 24/7 (costs ~$7/month)
- `--max-instances=1` - Single instance (Discord bots shouldn't scale horizontally)
- `--memory=512Mi` - Enough for Discord bot
- `--allow-unauthenticated` - Cloud Run needs to be accessible (bot doesn't expose HTTP endpoint anyway)

---

### Step 8: Verify Deployment

```bash
# Check service status
gcloud run services describe discord-bot-laura --region europe-west1

# View logs
gcloud run services logs read discord-bot-laura --region europe-west1 --limit=50
```

You should see:
```
✅ Bot logged in as: Laura#1234
🎭 Agent: LAURA
✅ Database connected
✅ n8n webhook test successful
```

---

## 🔄 Update Deployment (After Code Changes)

```bash
cd discord-bots/

# 1. Rebuild and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/discord-bot-laura

# 2. Redeploy
gcloud run deploy discord-bot-laura \
  --image gcr.io/YOUR_PROJECT_ID/discord-bot-laura \
  --region europe-west1
```

The deployment will use the existing environment variables and secrets.

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Real-time logs
gcloud run services logs tail discord-bot-laura --region europe-west1

# Last 100 lines
gcloud run services logs read discord-bot-laura --region europe-west1 --limit=100

# Filter for errors
gcloud run services logs read discord-bot-laura --region europe-west1 --limit=100 | grep "❌"
```

### Check Service Status

```bash
gcloud run services describe discord-bot-laura --region europe-west1
```

### Update Environment Variables

```bash
gcloud run services update discord-bot-laura \
  --region europe-west1 \
  --set-env-vars "LOG_LEVEL=debug"
```

### Update Secrets

```bash
# Update a secret value
echo -n "NEW_VALUE" | gcloud secrets versions add DISCORD_BOT_TOKEN --data-file=-

# Cloud Run will use the new version automatically
```

---

## 💰 Cost Estimation

### Discord Bot on Cloud Run

| Resource | Usage | Cost (Monthly) |
|----------|-------|---------------|
| CPU (1 vCPU) | 24/7 | ~$5 |
| Memory (512MB) | 24/7 | ~$2 |
| **Total** | | **~$7/month** |

**Note**: This assumes `--min-instances=1` to keep bot online 24/7.

---

## 🔐 Security Best Practices

### 1. Use Secrets Manager ✅
Never put credentials in environment variables - use secrets!

### 2. Separate Secrets for Each Agent
```bash
# Laura
DISCORD_BOT_TOKEN_LAURA
N8N_WEBHOOK_URL_LAURA

# Luka (when you add him)
DISCORD_BOT_TOKEN_LUKA
N8N_WEBHOOK_URL_LUKA
```

### 3. Restrict Service Account Permissions
Create a dedicated service account:

```bash
# Create service account
gcloud iam service-accounts create discord-bot-laura \
  --display-name="Discord Bot Laura"

# Deploy with custom service account
gcloud run deploy discord-bot-laura \
  --service-account discord-bot-laura@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  ...
```

---

## 🤖 Deploy Multiple Agents

When you're ready to deploy Luka and Nino:

### 1. Create Separate Services

```bash
# Luka
gcloud run deploy discord-bot-luka \
  --image gcr.io/YOUR_PROJECT_ID/discord-bot-laura \
  --region europe-west1 \
  --set-env-vars "AGENT_NAME=luka" \
  --set-secrets "DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN_LUKA:latest,N8N_WEBHOOK_URL=N8N_WEBHOOK_URL_LUKA:latest" \
  ...

# Nino
gcloud run deploy discord-bot-nino \
  --image gcr.io/YOUR_PROJECT_ID/discord-bot-laura \
  --region europe-west1 \
  --set-env-vars "AGENT_NAME=nino" \
  --set-secrets "DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN_NINO:latest,N8N_WEBHOOK_URL=N8N_WEBHOOK_URL_NINO:latest" \
  ...
```

**Same Docker image, different configuration!** 🎉

---

## 🚨 Troubleshooting

### Bot Shows Offline
- Check logs: `gcloud run services logs read discord-bot-laura --region europe-west1`
- Verify secret: `gcloud secrets versions access latest --secret=DISCORD_BOT_TOKEN`
- Check bot token is valid in Discord Developer Portal

### Database Connection Fails
- Verify secret: `gcloud secrets versions access latest --secret=DISCORD_DATABASE_URL`
- Check database URL has `?sslmode=require`
- Verify Neon database is accessible from internet

### n8n Webhook Timeout
- Check n8n workflow is Active
- Test webhook URL in browser
- Verify Cloud Run can reach n8n Cloud (should work, but check firewall)

### Service Won't Start
- Check logs for errors
- Verify all secrets are created and accessible
- Test Docker image locally first

---

## 📊 Cloud Console Monitoring

View your service in Cloud Console:
```
https://console.cloud.google.com/run/detail/europe-west1/discord-bot-laura
```

You can:
- View logs
- See metrics (CPU, memory, requests)
- Update configuration
- View revisions
- Set up alerts

---

## 🔄 CI/CD (Optional - Advanced)

To auto-deploy on git push, add to your `cloudbuild.yaml`:

```yaml
# Discord Bot Build
- name: 'gcr.io/cloud-builders/docker'
  args:
    - 'build'
    - '-t'
    - 'gcr.io/$PROJECT_ID/discord-bot-laura:$COMMIT_SHA'
    - 'discord-bots/'

- name: 'gcr.io/cloud-builders/docker'
  args:
    - 'push'
    - 'gcr.io/$PROJECT_ID/discord-bot-laura:$COMMIT_SHA'

- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'discord-bot-laura'
    - '--image'
    - 'gcr.io/$PROJECT_ID/discord-bot-laura:$COMMIT_SHA'
    - '--region'
    - 'europe-west1'
```

**For now, manual deployment is fine!**

---

## ✅ Quick Deployment Checklist

- [ ] Test bot locally (`npm run dev`)
- [ ] Enable Cloud Run, Container Registry, Secret Manager APIs
- [ ] Create secrets (bot token, database URL, n8n URL)
- [ ] Grant service account access to secrets
- [ ] Build and push Docker image (`gcloud builds submit`)
- [ ] Deploy to Cloud Run
- [ ] Check logs (`gcloud run services logs tail`)
- [ ] Test bot in Discord
- [ ] Monitor for 24 hours

---

Need help? Check the logs first! 🚀

