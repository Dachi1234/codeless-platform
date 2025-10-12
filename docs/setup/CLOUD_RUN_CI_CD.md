# ☁️ Cloud Run CI/CD Setup Guide

**Status**: Configured for automatic deployment  
**Last Updated**: October 11, 2025

---

## 🎯 **Overview**

Your backend now automatically deploys to Cloud Run whenever you push to the `main` branch on GitHub.

---

## 🔄 **How It Works**

```
1. You push code to GitHub (main branch)
        ↓
2. Cloud Build Trigger detects the push
        ↓
3. Cloud Build runs cloudbuild.yaml
        ↓
4. Builds Docker image with Dockerfile.cloudrun
        ↓
5. Pushes image to Google Container Registry
        ↓
6. Deploys to Cloud Run (europe-west1)
        ↓
7. Your backend is updated! (5-8 minutes total)
```

---

## 📋 **What Was Configured**

### **1. Cloud Build Trigger**
- **Name**: `deploy-backend-to-cloud-run`
- **Event**: Push to `main` branch
- **Source**: `Dachi1234/codeless-platform`
- **Config**: `cloudbuild.yaml` (in repo root)

### **2. Build Configuration** (`cloudbuild.yaml`)
- **Step 1**: Build Docker image using `Dockerfile.cloudrun`
- **Step 2**: Push image to GCR with tags (commit SHA + latest)
- **Step 3**: Deploy to Cloud Run (europe-west1)
- **Timeout**: 30 minutes max
- **Machine**: N1_HIGHCPU_8 (fast builds)

---

## 🚀 **How to Use**

### **Normal Workflow:**

```bash
# 1. Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# 2. Wait 5-8 minutes
# Cloud Build automatically:
#   - Builds your backend
#   - Deploys to Cloud Run
#   - Updates https://codeless-backend-231098067761.europe-west1.run.app

# 3. Test your changes
curl https://codeless-backend-231098067761.europe-west1.run.app/actuator/health
```

---

## 📊 **Monitoring Deployments**

### **View Build Status:**
```
https://console.cloud.google.com/cloud-build/builds?project=codeless-platform
```

You'll see:
- ✅ **SUCCESS** - Deployment completed
- 🔄 **WORKING** - Build in progress
- ❌ **FAILED** - Build error (check logs)

### **View Logs:**
1. Click on a build
2. See detailed logs for each step
3. Identify any errors

### **Build Timeline:**
```
0:00  - Trigger detected
0:30  - Clone repository
1:00  - Build Docker image (Step 1) - 8-12 min
13:00 - Push to GCR (Step 2) - 1-2 min
15:00 - Deploy to Cloud Run (Step 3) - 2-3 min
18:00 - DONE! ✅
```

---

## 🔧 **Manual Deployment (If Needed)**

If you need to deploy without pushing to GitHub:

```powershell
# From project root
.\cloud-run-setup.ps1
```

This uses your **local files** instead of GitHub.

---

## 🎛️ **Configuration**

### **Edit Build Steps:**
Edit `cloudbuild.yaml` in repo root:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/codeless-backend:$COMMIT_SHA', ...]
```

### **Change Region:**
Edit Step 3 in `cloudbuild.yaml`:

```yaml
args:
  - 'run'
  - 'deploy'
  - 'codeless-backend'
  - '--region'
  - 'us-central1'  # ← Change region here
```

### **Change Resource Limits:**
Edit `options` in `cloudbuild.yaml`:

```yaml
options:
  machineType: 'N1_HIGHCPU_32'  # Faster machine
```

---

## 🚨 **Troubleshooting**

### **Build Fails: "Permission Denied"**

**Cause**: Cloud Build service account lacks permissions

**Fix**:
1. Go to: https://console.cloud.google.com/cloud-build/settings?project=codeless-platform
2. Enable these roles:
   - **Cloud Run Admin** ✓
   - **Service Account User** ✓
   - **Storage Admin** ✓

### **Build Fails: "Image not found"**

**Cause**: Dockerfile.cloudrun has errors

**Fix**:
1. Test locally first:
   ```bash
   cd backend/codeless-backend
   docker build -f Dockerfile.cloudrun -t test .
   ```
2. Fix any errors
3. Push again

### **Build Succeeds but App Crashes**

**Cause**: Missing environment variables

**Fix**:
1. Go to Cloud Run service
2. Edit & Deploy New Revision
3. Check all environment variables are set

### **Build is Slow (>15 minutes)**

**Cause**: Large dependencies or slow machine

**Fix**:
1. Use faster machine in `cloudbuild.yaml`:
   ```yaml
   options:
     machineType: 'N1_HIGHCPU_32'
   ```
2. Enable build caching (automatically done)

---

## 💰 **Cost Implications**

### **Cloud Build Free Tier:**
- **First 120 build-minutes/day**: FREE
- **After that**: $0.003/build-minute

### **Your Typical Build:**
- **Time**: ~15 minutes
- **Daily builds**: ~5-10
- **Cost**: **$0/month** (within free tier)

### **If You Exceed Free Tier:**
- 20 builds/day × 15 min = 300 min/day
- (300 - 120) × $0.003 = **$0.54/day** = ~$16/month

**Recommendation**: Stay under 8 builds/day to remain free!

---

## 🎯 **Best Practices**

### **1. Test Locally First**
```bash
# Test before pushing
cd backend/codeless-backend
mvn clean package
# Only push if build succeeds
```

### **2. Use Feature Branches**
```bash
# Don't push every change to main
git checkout -b feature/new-thing
# Make changes, test locally
git push origin feature/new-thing
# Merge to main when ready (triggers deploy)
```

### **3. Monitor Builds**
- Check build status before making more changes
- Don't spam pushes (costs money after free tier!)

### **4. Use Commit Messages Wisely**
```bash
# Good: Descriptive
git commit -m "feat: Add email notifications for courses"

# Bad: Generic
git commit -m "fix"
```

This helps identify what each deployment contains.

---

## 📈 **Comparison: Manual vs Auto-Deploy**

| Aspect | Manual (script) | Auto-Deploy (CI/CD) |
|--------|----------------|---------------------|
| **Trigger** | Run `.\cloud-run-setup.ps1` | Push to GitHub |
| **Source** | Local files | GitHub repo |
| **Time** | 15-20 min | 15-20 min |
| **Convenience** | Need to run script | Automatic |
| **Cost** | Same | Same |
| **Best for** | Testing local changes | Production deploys |

---

## 🔐 **Security Notes**

### **Service Account Permissions:**
Cloud Build uses a service account with these permissions:
- Build containers
- Push to Container Registry
- Deploy to Cloud Run

**DO NOT** give it permissions to:
- Delete resources
- Access database directly
- Modify billing

### **Secrets Management:**
Environment variables (DB passwords, API keys) are stored in Cloud Run, **NOT** in GitHub or Cloud Build.

This keeps them secure!

---

## 🎉 **Summary**

**You now have:**
- ✅ Automatic deployment to Cloud Run on push
- ✅ Build monitoring via Cloud Console
- ✅ Version tagging with commit SHAs
- ✅ Fast builds with optimized machines
- ✅ Free tier usage (under 8 builds/day)

**Your workflow:**
```bash
git add .
git commit -m "Update backend"
git push origin main
# ☕ Wait 5-8 minutes
# ✅ Deployed automatically!
```

---

**No more manual deployment scripts! Just push and go!** 🚀

