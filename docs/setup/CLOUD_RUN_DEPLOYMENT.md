# ☁️ Google Cloud Run Deployment Guide

**Last Updated**: October 11, 2025  
**Status**: Ready for deployment (parallel to Render)

---

## 📋 Overview

This guide walks you through deploying the Codeless backend to **Google Cloud Run** as an alternative to Render. You can run both simultaneously for testing.

---

## 🎯 Why Cloud Run?

### **Advantages over Render**:
- ✅ **Faster cold starts** (~2-3 seconds vs 10-15 seconds)
- ✅ **Better performance** (dedicated resources)
- ✅ **Auto-scaling** (0 to 1000+ instances)
- ✅ **Pay per use** (only charged for actual requests)
- ✅ **Free tier** (2M requests/month)

### **Current Setup**:
- **Render**: Production (https://codeless-platform.onrender.com)
- **Cloud Run**: Testing/Staging (to be deployed)

---

## 📦 Prerequisites

### 1. **Google Cloud Account**
- Create account: https://console.cloud.google.com
- Enable billing (credit card required, but we'll stay in free tier)
- Get $300 free credits for 90 days (new accounts)

### 2. **Install gcloud CLI**
- **Windows**: https://cloud.google.com/sdk/docs/install#windows
- **Mac**: `brew install google-cloud-sdk`
- **Linux**: `curl https://sdk.cloud.google.com | bash`

### 3. **Verify Installation**
```bash
gcloud --version
```

Should show: `Google Cloud SDK 450.0.0+`

---

## 🚀 Deployment Steps

### **Step 1: Initial Setup**

1. **Login to Google Cloud**:
```bash
gcloud auth login
```
This opens browser for authentication.

2. **Create New Project** (or use existing):
```bash
# Create project
gcloud projects create codeless-platform --name="Codeless Platform"

# Set as active project
gcloud config set project codeless-platform

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
# Link your billing account to the project
```

3. **Enable Required APIs**:
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

### **Step 2: Build Container**

We've already created the `Dockerfile` for you in `backend/codeless-backend/`.

**Build and push to Google Container Registry**:

```bash
# Navigate to backend
cd backend/codeless-backend

# Build and push (this takes ~5 minutes first time)
gcloud builds submit --tag gcr.io/codeless-platform/codeless-backend
```

**What this does**:
- Builds Docker image using multi-stage build
- Optimizes for size and security
- Pushes to Google Container Registry
- Automatically caches layers for faster future builds

---

### **Step 3: Deploy to Cloud Run**

```bash
gcloud run deploy codeless-backend \
  --image gcr.io/codeless-platform/codeless-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300
```

**Configuration explained**:
- `--memory 1Gi`: 1GB RAM (free tier: up to 2GB)
- `--cpu 1`: 1 vCPU (free tier: up to 1 vCPU)
- `--max-instances 10`: Scale up to 10 containers
- `--min-instances 0`: Scale to zero when idle (saves money)
- `--timeout 300`: 5 minutes max request time
- `--allow-unauthenticated`: Public access (like Render)

---

### **Step 4: Set Environment Variables**

After deployment, add environment variables:

**Option A: Using Console** (easier):
1. Go to: https://console.cloud.google.com/run
2. Click on `codeless-backend` service
3. Click "EDIT & DEPLOY NEW REVISION"
4. Go to "Variables & Secrets" tab
5. Add these environment variables:

```bash
DB_URL=<your-neon-postgresql-url>
DB_USERNAME=neondb_owner
DB_PASSWORD=<your-neon-password>
SECURITY_JWT_SECRET=<your-jwt-secret>
CORS_ALLOWED_ORIGINS=https://codeless.digital
APP_URL=https://codeless.digital
CLOUDINARY_CLOUD_NAME=dd5y9xng8
CLOUDINARY_API_KEY=122452822528191
CLOUDINARY_API_SECRET=_HL2CRm46LYPPUgmiMf8fxqNGJo
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_CLIENT_SECRET=<your-paypal-client-secret>
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

6. Click "DEPLOY"

**Option B: Using CLI**:
```bash
gcloud run services update codeless-backend \
  --region us-central1 \
  --set-env-vars="DB_URL=<url>,DB_USERNAME=<user>,DB_PASSWORD=<pass>,SECURITY_JWT_SECRET=<secret>,CORS_ALLOWED_ORIGINS=https://codeless.digital"
```

---

### **Step 5: Get Service URL**

```bash
gcloud run services describe codeless-backend \
  --region us-central1 \
  --format='value(status.url)'
```

This returns something like:
```
https://codeless-backend-abc123-uc.a.run.app
```

---

### **Step 6: Test Deployment**

```bash
# Test health endpoint
curl https://codeless-backend-abc123-uc.a.run.app/actuator/health

# Should return:
{"status":"UP"}
```

---

## 🔄 Using Both Render and Cloud Run

### **Parallel Setup**:

You can run **both** backends simultaneously for testing:

1. **Render** (production): `https://codeless-platform.onrender.com`
2. **Cloud Run** (testing): `https://codeless-backend-abc123-uc.a.run.app`

### **How to Switch Frontend**:

Create a **staging** Vercel deployment:

1. **Keep production** pointing to Render:
   - `frontend/vercel.json` → Render URL

2. **Create staging branch**:
```bash
git checkout -b staging
```

3. **Update `vercel.json` for staging**:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://codeless-backend-abc123-uc.a.run.app/api/:path*"
    }
  ]
}
```

4. **Deploy to Vercel**:
```bash
vercel --prod
```

Now you have:
- **Production**: Vercel → Render (stable)
- **Staging**: Vercel → Cloud Run (testing)

---

## 💰 Cost Estimation

### **Free Tier Limits**:
- **Requests**: 2 million/month
- **CPU**: 180,000 vCPU-seconds/month
- **Memory**: 360,000 GB-seconds/month
- **Network**: 1 GB outbound/month

### **For Codeless Platform** (estimated):
- **Low traffic** (100 users/day): **$0/month** (within free tier)
- **Medium traffic** (1000 users/day): **$5-10/month**
- **High traffic** (10,000 users/day): **$30-50/month**

### **Compared to Render**:
- **Render Free**: $0 (sleeps after 15 min)
- **Render Paid**: $7/month (always on)
- **Cloud Run**: $0-50/month (scales automatically)

---

## 🔧 Maintenance

### **Redeploy After Code Changes**:

1. Push to GitHub
2. Run deployment script:
```bash
# Windows
.\cloud-run-setup.ps1

# Mac/Linux
./cloud-run-setup.sh
```

### **View Logs**:
```bash
# Real-time logs
gcloud run services logs tail codeless-backend --region us-central1

# Or use Console:
https://console.cloud.google.com/run/detail/us-central1/codeless-backend/logs
```

### **Update Environment Variables**:
```bash
gcloud run services update codeless-backend \
  --region us-central1 \
  --update-env-vars KEY=value
```

### **Scale Configuration**:
```bash
# Increase max instances
gcloud run services update codeless-backend \
  --region us-central1 \
  --max-instances 20

# Set minimum instances (always warm, costs more)
gcloud run services update codeless-backend \
  --region us-central1 \
  --min-instances 1
```

---

## 🎯 Automated Deployment (CI/CD)

### **Option: GitHub Actions**

Create `.github/workflows/deploy-cloud-run.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - cloud-run  # Deploy when pushing to cloud-run branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy codeless-backend \
            --image gcr.io/codeless-platform/codeless-backend \
            --region us-central1 \
            --platform managed
```

---

## 🚨 Troubleshooting

### **Issue: Build Fails**
```bash
# Check Docker builds locally first
cd backend/codeless-backend
docker build -t test-build .
```

### **Issue: Service Unreachable**
```bash
# Check if service is running
gcloud run services describe codeless-backend --region us-central1

# Check logs
gcloud run services logs tail codeless-backend --region us-central1
```

### **Issue: Database Connection Failed**
- Verify `DB_URL` environment variable is set
- Check Neon PostgreSQL allows connections from Cloud Run
- Neon should allow connections from anywhere (0.0.0.0/0)

### **Issue: CORS Errors**
- Update `CORS_ALLOWED_ORIGINS` to include Cloud Run URL
- Or set to `*` for testing (not recommended for production)

---

## 📊 Monitoring

### **Cloud Run Metrics**:
- Dashboard: https://console.cloud.google.com/run
- View: Request count, latency, errors, memory usage

### **Set Up Alerts**:
1. Go to Cloud Monitoring
2. Create alert for:
   - High error rate (>5%)
   - High latency (>2 seconds)
   - High memory usage (>80%)

---

## ✅ Quick Reference Commands

```bash
# Deploy
gcloud run deploy codeless-backend --image gcr.io/codeless-platform/codeless-backend --region us-central1

# View logs
gcloud run services logs tail codeless-backend --region us-central1

# Get URL
gcloud run services describe codeless-backend --region us-central1 --format='value(status.url)'

# Update env vars
gcloud run services update codeless-backend --region us-central1 --set-env-vars KEY=VALUE

# Delete service
gcloud run services delete codeless-backend --region us-central1
```

---

## 🎉 Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Run manual testing guide
3. ✅ Compare performance with Render
4. ✅ Monitor costs for a week
5. ✅ Decide whether to switch fully or keep both

---

**Questions?** Check the [troubleshooting section](#-troubleshooting) or Google Cloud Run docs: https://cloud.google.com/run/docs

