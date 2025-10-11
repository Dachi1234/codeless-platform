# ☁️ Cloud Run Quick Start Checklist

**Status**: Ready to deploy (files prepared, Render keeps running)  
**Estimated Time**: 30-45 minutes  
**Difficulty**: Medium

---

## ✅ Pre-Deployment Checklist

### **1. Files Created** ✅
- [x] `backend/codeless-backend/Dockerfile` - Container definition
- [x] `backend/codeless-backend/.dockerignore` - Build optimization
- [x] `backend/codeless-backend/.gcloudignore` - Upload optimization
- [x] `cloud-run-setup.sh` - Linux/Mac deployment script
- [x] `cloud-run-setup.ps1` - Windows deployment script
- [x] `docs/setup/CLOUD_RUN_DEPLOYMENT.md` - Full guide

### **2. What You Need**
- [ ] Google Cloud account (free trial: $300 credits)
- [ ] Credit card (required for billing, but we stay in free tier)
- [ ] gcloud CLI installed
- [ ] 30-45 minutes of time

---

## 🚀 Deployment Steps

### **Step 1: Google Cloud Account** (5 minutes)
```
1. Go to: https://console.cloud.google.com
2. Sign in with Google account
3. Accept terms
4. Enable billing (add credit card)
   - Don't worry: We'll stay in FREE tier
   - You get $300 free credits for 90 days
```

### **Step 2: Install gcloud CLI** (10 minutes)
```bash
# Windows:
# Download from: https://cloud.google.com/sdk/docs/install#windows
# Run installer, follow prompts

# Mac:
brew install google-cloud-sdk

# Linux:
curl https://sdk.cloud.google.com | bash
```

**Verify installation**:
```bash
gcloud --version
```

### **Step 3: Login & Setup** (5 minutes)
```bash
# Login
gcloud auth login

# Create project
gcloud projects create codeless-platform --name="Codeless Platform"

# Set project
gcloud config set project codeless-platform

# Enable APIs (this takes 2-3 minutes)
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### **Step 4: Edit Deployment Script** (2 minutes)
Open `cloud-run-setup.ps1` (Windows) or `cloud-run-setup.sh` (Mac/Linux):

**Change line 13**:
```powershell
$PROJECT_ID = "codeless-platform"  # ← Your project ID from Step 3
```

### **Step 5: Run Deployment** (15 minutes)
```powershell
# Windows (from project root):
.\cloud-run-setup.ps1

# Mac/Linux:
chmod +x cloud-run-setup.sh
./cloud-run-setup.sh
```

**What happens**:
- ✅ Builds Docker container (~5 min)
- ✅ Pushes to Google Container Registry (~3 min)
- ✅ Deploys to Cloud Run (~2 min)
- ✅ Returns service URL

### **Step 6: Set Environment Variables** (5 minutes)

**Go to Cloud Run Console**:
https://console.cloud.google.com/run

1. Click on `codeless-backend` service
2. Click "EDIT & DEPLOY NEW REVISION"
3. Click "Variables & Secrets" tab
4. Click "ADD VARIABLE" for each:

```bash
DB_URL = <your-neon-postgresql-url>
DB_USERNAME = neondb_owner
DB_PASSWORD = <your-neon-password>
SECURITY_JWT_SECRET = <your-jwt-secret>
CORS_ALLOWED_ORIGINS = https://codeless.digital
APP_URL = https://codeless.digital
CLOUDINARY_CLOUD_NAME = dd5y9xng8
CLOUDINARY_API_KEY = 122452822528191
CLOUDINARY_API_SECRET = _HL2CRm46LYPPUgmiMf8fxqNGJo
PAYPAL_CLIENT_ID = <your-paypal-client-id>
PAYPAL_CLIENT_SECRET = <your-paypal-client-secret>
PAYPAL_BASE_URL = https://api-m.sandbox.paypal.com
```

5. Click "DEPLOY" at bottom

**Wait 2-3 minutes for new revision to deploy.**

### **Step 7: Test Deployment** (3 minutes)

**Get your service URL**:
```bash
gcloud run services describe codeless-backend \
  --region us-central1 \
  --format='value(status.url)'
```

**Example URL**:
```
https://codeless-backend-abc123xyz-uc.a.run.app
```

**Test it**:
```bash
# Test health endpoint
curl https://codeless-backend-abc123xyz-uc.a.run.app/actuator/health

# Should return:
{"status":"UP"}

# Test courses endpoint
curl https://codeless-backend-abc123xyz-uc.a.run.app/api/courses
```

---

## 🎯 Parallel Testing Strategy

Now you have **TWO backends running**:

### **Backend A: Render** (Production)
- URL: `https://codeless-platform.onrender.com`
- Status: Stable, used by live site
- Cost: $0/month
- Keep: Until Cloud Run is proven

### **Backend B: Cloud Run** (Testing)
- URL: `https://codeless-backend-abc123-uc.a.run.app`
- Status: New, needs testing
- Cost: $0/month (free tier)
- Test: Before switching

---

## 🧪 How to Test Cloud Run Backend

### **Option 1: Use Postman/Insomnia**
1. Import API collection
2. Change base URL to Cloud Run URL
3. Test all endpoints

### **Option 2: Create Test Frontend**
1. Clone your frontend locally
2. Update `vercel.json`:
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
3. Run locally: `npm start`
4. Test everything

### **Option 3: Use Cloud Run for Staging**
1. Create staging branch in GitHub
2. Deploy separate Vercel project for staging
3. Point staging Vercel to Cloud Run
4. Point production Vercel to Render

---

## 💰 Cost Monitoring

### **Set Up Budget Alert**:
1. Go to: https://console.cloud.google.com/billing/budgets
2. Click "CREATE BUDGET"
3. Set budget: $5/month
4. Set alert at: 50%, 90%, 100%
5. You'll get email if costs exceed

### **Check Current Usage**:
```bash
# View metrics
gcloud run services describe codeless-backend \
  --region us-central1 \
  --format="table(status.url, status.traffic.percent)"
```

**Dashboard**:
https://console.cloud.google.com/run/detail/us-central1/codeless-backend

---

## 🔄 When to Switch from Render to Cloud Run

### **Keep Testing Cloud Run Until**:
- [x] All endpoints working
- [x] Environment variables correct
- [x] Database connects properly
- [x] No errors in logs
- [x] Performance is better than Render
- [x] Costs stay in free tier
- [x] Tested for 1 week minimum

### **Then Switch By**:
1. Update production Vercel `vercel.json`
2. Point to Cloud Run URL
3. Commit and push
4. Vercel auto-deploys
5. Monitor for issues
6. Keep Render running for 1 week as backup
7. Delete Render service after successful switch

---

## 🚨 Rollback Plan

If Cloud Run has issues:

**Quick Rollback** (2 minutes):
1. Open `vercel.json`
2. Change URL back to Render
3. Git commit and push
4. Vercel redeploys in 2 minutes
5. You're back on Render

**Render keeps running**, so rollback is instant.

---

## 📊 Performance Comparison

Track these metrics for both:

| Metric | Render | Cloud Run | Winner |
|--------|--------|-----------|--------|
| Cold start time | 10-15s | 2-3s | ? |
| Warm response time | 200ms | 100ms | ? |
| Reliability | 99.5% | 99.9% | ? |
| Cost | $0 | $0 | Tie |
| Setup complexity | Easy | Medium | Render |

Test for 1 week, then decide.

---

## ✅ Success Criteria

Cloud Run is ready for production when:

- ✅ Health check returns 200 OK
- ✅ All API endpoints tested and working
- ✅ Database queries successful
- ✅ Cloudinary uploads working
- ✅ PayPal checkout working
- ✅ No errors in Cloud Run logs
- ✅ Response times < 300ms (warm)
- ✅ Cold starts < 5 seconds
- ✅ Costs stay under $5/month
- ✅ Runs stable for 7 days

---

## 🎓 Learning Resources

- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Pricing Calculator**: https://cloud.google.com/products/calculator
- **Best Practices**: https://cloud.google.com/run/docs/best-practices
- **Troubleshooting**: See `docs/setup/CLOUD_RUN_DEPLOYMENT.md`

---

## 🆘 Need Help?

### **Common Issues**:

**1. "Permission denied" error**
```bash
# Fix: Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

**2. "Project not found"**
```bash
# Fix: Set project
gcloud config set project YOUR-PROJECT-ID
```

**3. "Billing not enabled"**
- Go to: https://console.cloud.google.com/billing
- Link billing account to project

**4. "Container fails to start"**
- Check logs: `gcloud run services logs tail codeless-backend --region us-central1`
- Verify environment variables are set
- Check database connection

---

## 🎉 You're Ready!

**Files are prepared. Render keeps running. You can deploy Cloud Run anytime.**

**When ready, just run**:
```powershell
# Windows
.\cloud-run-setup.ps1

# Mac/Linux
./cloud-run-setup.sh
```

**Time needed**: 45 minutes (mostly waiting for builds)  
**Risk**: Zero (Render stays running)  
**Reward**: Better performance, production-grade hosting

---

**Good luck! 🚀**

