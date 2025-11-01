# Quick Answers to Common Questions

## ❓ Your Questions Answered

### 1️⃣ How to Create New Service Deployment in Cloud Run?

**Quick Answer:**

```bash
# 1. Build and push Docker image
cd discord-bots/
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/discord-bot-laura

# 2. Create secrets first (one-time)
echo -n "YOUR_TOKEN" | gcloud secrets create DISCORD_BOT_TOKEN --data-file=-
echo -n "YOUR_DB_URL" | gcloud secrets create DISCORD_DATABASE_URL --data-file=-
echo -n "YOUR_WEBHOOK" | gcloud secrets create N8N_WEBHOOK_URL --data-file=-

# 3. Grant access to secrets (one-time)
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding DISCORD_BOT_TOKEN \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
# (repeat for other secrets)

# 4. Deploy to Cloud Run
gcloud run deploy discord-bot-laura \
  --image gcr.io/YOUR_PROJECT_ID/discord-bot-laura \
  --region europe-west1 \
  --platform managed \
  --memory=512Mi \
  --min-instances=1 \
  --max-instances=1 \
  --set-env-vars "AGENT_NAME=laura,MAX_CONTEXT_MESSAGES=10" \
  --set-secrets "DISCORD_BOT_TOKEN=DISCORD_BOT_TOKEN:latest,DATABASE_URL=DISCORD_DATABASE_URL:latest,N8N_WEBHOOK_URL=N8N_WEBHOOK_URL:latest"
```

**Full Guide:** See `CLOUD_RUN_DEPLOYMENT.md`

---

### 2️⃣ Where to Find PostgreSQL Host in Neon for n8n?

**Quick Answer:**

Go to **Neon Console** → **Dashboard** → Find your **connection string**:

```
postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech:5432/db?sslmode=require
                       ↑                                            ↑
                    THIS IS YOUR HOST                           THIS IS PORT
```

**Extract the Host:**
```
ep-cool-name-123456.us-east-2.aws.neon.tech
```

**Enter in n8n PostgreSQL Node:**
```
Host: ep-cool-name-123456.us-east-2.aws.neon.tech
Port: 5432
Database: codeless_db
User: your_username
Password: your_password
SSL: ☑ Enable
```

**Full Guide:** See `NEON_CONNECTION_GUIDE.md`

---

## 🎯 What to Do Next

### For Local Testing:
1. Read `QUICK_CHECKLIST.md`
2. Follow steps to get bot running locally
3. Test with Discord

### For Production Deployment:
1. Test locally first (`npm run dev`)
2. Read `CLOUD_RUN_DEPLOYMENT.md`
3. Deploy to Cloud Run
4. Monitor logs

### For n8n Integration:
1. Read `N8N_WORKFLOW_GUIDE.md`
2. Create webhook workflow
3. Start with simple echo test
4. Add OpenAI later

---

## 📚 Documentation Map

| Question | Read This |
|----------|-----------|
| How to setup bot locally? | `QUICK_CHECKLIST.md` |
| Where's the Neon host? | `NEON_CONNECTION_GUIDE.md` |
| How to deploy to Cloud Run? | `CLOUD_RUN_DEPLOYMENT.md` |
| How to create n8n workflows? | `N8N_WORKFLOW_GUIDE.md` |
| What's the architecture? | `../docs/discord-bots/ARCHITECTURE_V3_FINAL.md` |
| Full documentation? | `README.md` |

---

## 🔑 Connection Details Cheat Sheet

### For Discord Bot `.env`:
```bash
DATABASE_URL=postgresql://user:pass@HOST:5432/codeless_db?sslmode=require
```

### For n8n (separate fields):
```
Host: ep-xxx.region.aws.neon.tech  (without postgresql://)
Port: 5432
Database: codeless_db
User: your_username
Password: your_password
SSL: Enable ☑
```

### For Cloud Run Secrets:
```bash
# Create once, reference in deployment
DISCORD_BOT_TOKEN        → From Discord Developer Portal
DISCORD_DATABASE_URL     → Full Neon connection string
N8N_WEBHOOK_URL          → From n8n workflow
```

---

## ⚡ Common Tasks

### Update Bot Code and Redeploy:
```bash
cd discord-bots/
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/discord-bot-laura
gcloud run deploy discord-bot-laura --image gcr.io/YOUR_PROJECT_ID/discord-bot-laura --region europe-west1
```

### View Logs:
```bash
gcloud run services logs tail discord-bot-laura --region europe-west1
```

### Test Connection:
```bash
# Local
npm run dev

# Production
gcloud run services logs read discord-bot-laura --region europe-west1 --limit=50
```

---

Need more details? Check the specific guide! 🚀

