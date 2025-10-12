# 🚀 Deployment Guide - Codeless E-Learning Platform

**Last Updated**: October 9, 2025  
**⚠️ NOTE**: This guide covers Render deployment. The project has since moved to **Google Cloud Run** with automated CI/CD.  
**📚 Current Deployment**: See `CLOUD_RUN_DEPLOYMENT.md` and `CLOUD_RUN_CI_CD.md` for current setup.

**Deployment Stack**: 100% Free Tier  
**Estimated Setup Time**: 45-60 minutes

---

## 📋 **What You'll Need**

### **Accounts to Create (All Free):**
1. ✅ GitHub account
2. ✅ Render.com account
3. ✅ Vercel account (or Netlify)
4. ✅ Neon.tech account (or Supabase)
5. ✅ Cloudinary account

---

## 🎯 **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    USERS (Browser)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
      ▼                       ▼
┌──────────┐           ┌──────────────┐
│  Vercel  │           │   Render     │
│ Frontend │◄─────────►│   Backend    │
│ (Angular)│           │ (Spring Boot)│
└──────────┘           └───────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
            ┌───────────────┐     ┌─────────────┐
            │  Neon/Supabase│     │ Cloudinary  │
            │  PostgreSQL   │     │   Storage   │
            └───────────────┘     └─────────────┘
```

---

## 📦 **PHASE 1: Prepare Your Code**

### **Step 1.1: Update .gitignore**

Make sure these are ignored:
```
# Environment files (contains API keys)
/frontend/src/environments/environment.ts
/frontend/src/environments/environment.prod.ts

# Backend secrets
/backend/codeless-backend/src/main/resources/application.yml
/backend/codeless-backend/src/main/resources/application-prod.yml

# Build artifacts
/frontend/dist/
/frontend/.angular/
/backend/codeless-backend/target/

# Dependencies
/frontend/node_modules/
```

### **Step 1.2: Create Production Configuration Files**

These files will use **environment variables** instead of hardcoded values.

---

## 🗄️ **PHASE 2: Database Setup (Neon)**

### **Why Neon?**
- ✅ Free tier: 512 MB storage
- ✅ PostgreSQL 16
- ✅ No credit card required
- ✅ Auto-sleep after inactivity (saves resources)

### **Step 2.1: Create Neon Account**
1. Go to https://neon.tech
2. Sign up with GitHub
3. Click "Create a project"
4. Project name: `codeless-db`
5. Region: Choose closest to you
6. PostgreSQL version: 16

### **Step 2.2: Get Connection String**
After creation, you'll see:
```
postgres://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Save this!** You'll need it for backend deployment.

### **Step 2.3: Run Migrations**

Option A: **Use Neon SQL Editor (in browser)**
1. Click "SQL Editor" in Neon dashboard
2. Copy/paste each migration file:
   - `V1__initial_schema.sql`
   - `V2__create_orders_and_enrollments.sql`
   - `V3__add_course_enhanced_fields.sql`
   - ... (all V*.sql files in order)
3. Run each one

Option B: **Use Flyway (from local machine)**
```bash
cd backend/codeless-backend

# Edit application.yml temporarily with Neon connection string
# Then run:
mvn flyway:migrate
```

---

## 🖥️ **PHASE 3: Backend Deployment (Render)**

### **Why Render?**
- ✅ Free tier: 750 hours/month
- ✅ Auto-deploys from Git
- ✅ Built-in CI/CD
- ✅ Free SSL certificate

### **Step 3.1: Create Render Account**
1. Go to https://render.com
2. Sign up with GitHub

### **Step 3.2: Create Web Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `codeless-platform` repo
4. Configure:

**Build Settings:**
```
Name: codeless-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend/codeless-backend
Runtime: Java

Build Command:
./mvnw clean package -DskipTests

Start Command:
java -jar target/codeless-backend-0.0.1-SNAPSHOT.jar
```

**Instance Type:**
- Select: **Free** (512 MB RAM)

### **Step 3.3: Set Environment Variables**

In Render dashboard, go to "Environment" tab and add:

```
DB_URL=<your-neon-connection-string>
DB_USERNAME=<from-neon>
DB_PASSWORD=<from-neon>

SECURITY_JWT_SECRET=<generate-random-base64-string>
SECURITY_JWT_EXPIRATION_SECONDS=86400

# PayPal (optional for now, use sandbox)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox

# CORS (replace with your Vercel URL later)
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Generate JWT Secret:**
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### **Step 3.4: Deploy**
1. Click "Create Web Service"
2. Wait 5-10 minutes for build
3. Get your backend URL: `https://codeless-backend.onrender.com`

---

## 🌐 **PHASE 4: Frontend Deployment (Vercel)**

### **Why Vercel?**
- ✅ Optimized for Angular/React
- ✅ Free tier: Unlimited deployments
- ✅ Auto-deploys from Git
- ✅ Global CDN
- ✅ Free SSL

### **Step 4.1: Update Frontend for Production**

**frontend/src/environments/environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://codeless-backend.onrender.com/api',
  tinymceApiKey: 'YOUR_TINYMCE_API_KEY'
};
```

**frontend/angular.json** - Add production configuration:
```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ],
    "optimization": true,
    "outputHashing": "all",
    "sourceMap": false,
    "namedChunks": false,
    "extractLicenses": true,
    "vendorChunk": false,
    "buildOptimizer": true,
    "budgets": [
      {
        "type": "initial",
        "maximumWarning": "2mb",
        "maximumError": "5mb"
      }
    ]
  }
}
```

### **Step 4.2: Update API Calls**

**frontend/src/app/services/auth.service.ts** and all other services:

Change from:
```typescript
private readonly baseUrl = '/api/auth';
```

To:
```typescript
private readonly baseUrl = environment.production 
  ? `${environment.apiUrl}/auth`
  : '/api/auth';
```

**Or better - create an interceptor:**

Create `frontend/src/app/interceptors/api.interceptor.ts`:
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Only modify requests to /api
  if (req.url.startsWith('/api')) {
    const apiReq = req.clone({
      url: environment.production 
        ? req.url.replace('/api', environment.apiUrl)
        : req.url
    });
    return next(apiReq);
  }
  return next(req);
};
```

Add to `app.config.ts`:
```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideHttpClient(
      withInterceptors([authInterceptor, apiInterceptor])
    )
  ]
};
```

### **Step 4.3: Create Vercel Account**
1. Go to https://vercel.com
2. Sign up with GitHub

### **Step 4.4: Deploy to Vercel**
1. Click "Add New Project"
2. Import your GitHub repository
3. Configure:

**Framework Preset:** Angular  
**Root Directory:** `frontend`  
**Build Command:** `npm run build -- --configuration production`  
**Output Directory:** `dist/frontend/browser`  

**Environment Variables:**
```
TINYMCE_API_KEY=your_key_here
```

4. Click "Deploy"
5. Wait 3-5 minutes
6. Get your URL: `https://codeless-platform.vercel.app`

### **Step 4.5: Update Backend CORS**

Go back to Render → Environment variables:
```
ALLOWED_ORIGINS=https://codeless-platform.vercel.app,http://localhost:4200
```

Redeploy backend.

---

## 📸 **PHASE 5: Media Storage (Cloudinary)**

### **Why Cloudinary?**
- ✅ Free tier: 25 GB storage, 25 GB bandwidth/month
- ✅ Image/video optimization
- ✅ CDN delivery
- ✅ Easy API

### **Step 5.1: Create Account**
1. Go to https://cloudinary.com
2. Sign up for free

### **Step 5.2: Get Credentials**
Dashboard shows:
```
Cloud Name: dxxxxx
API Key: 123456789012345
API Secret: xxxxxxxxxxx
```

### **Step 5.3: Add to Backend**

**Render Environment Variables:**
```
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxx
```

### **Step 5.4: Update File Upload (Future Feature)**

When you implement video upload:
```java
// Use Cloudinary SDK
// Upload files to Cloudinary instead of local storage
```

---

## 🔐 **PHASE 6: Security Checklist**

### **Before Going Live:**

- [ ] **Change all default passwords** in database seed
- [ ] **Use strong JWT secret** (not the dev one)
- [ ] **Enable HTTPS only** (Vercel/Render do this automatically)
- [ ] **Set proper CORS** (only allow your frontend URL)
- [ ] **Review PLACEHOLDER_FUNCTIONALITY.md** - Fix all insecure code
- [ ] **PayPal**: Switch to live credentials (not sandbox)
- [ ] **Rate limiting**: Add to prevent abuse
- [ ] **SQL injection**: Already protected (JPA)
- [ ] **XSS**: Already sanitized (Angular)

---

## 📋 **PHASE 7: Git & GitHub**

### **Step 7.1: Initialize Git** (if not already)

```bash
cd C:\Users\Ryzen\Desktop\Codeless_Web

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Codeless E-Learning Platform v1.0"
```

### **Step 7.2: Create GitHub Repository**

1. Go to https://github.com
2. Click "New Repository"
3. Name: `codeless-elearning-platform`
4. Description: "Full-stack e-learning platform with courses, quizzes, and progress tracking"
5. **Public** or **Private** (your choice)
6. **Don't** initialize with README (we already have one)
7. Click "Create repository"

### **Step 7.3: Push to GitHub**

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/codeless-elearning-platform.git

# Push
git branch -M main
git push -u origin main
```

---

## 🎯 **PHASE 8: Custom Domain (Optional)**

### **Free Domain Options:**
1. **Freenom** - .tk, .ml, .ga domains (free)
2. **Vercel Subdomain** - yourapp.vercel.app (already free)

### **Paid Domain** (recommended):
1. Buy from **Namecheap** or **Google Domains** (~$10/year)
2. In Vercel: Settings → Domains → Add your domain
3. Update DNS records as shown

---

## 📊 **Cost Breakdown**

| Service | Free Tier | Paid Upgrade |
|---------|-----------|--------------|
| **Neon** | 512 MB | $19/mo (3 GB) |
| **Render** | 750 hrs/mo | $7/mo (always on) |
| **Vercel** | Unlimited | $20/mo (team features) |
| **Cloudinary** | 25 GB | $89/mo (105 GB) |
| **Domain** | Free (.tk) | $10/year (.com) |
| **TOTAL** | **$0/month** | ~$136/month |

**For MVP: Stay on free tier! Upgrade when you have paying users.**

---

## 🚀 **Quick Start Checklist**

### **Day 1: Setup Accounts**
- [ ] Create Neon account
- [ ] Create Render account
- [ ] Create Vercel account
- [ ] Create Cloudinary account
- [ ] Create GitHub account (if needed)

### **Day 2: Deploy Backend**
- [ ] Set up Neon database
- [ ] Run migrations
- [ ] Configure Render web service
- [ ] Set environment variables
- [ ] Deploy and test

### **Day 3: Deploy Frontend**
- [ ] Update environment files
- [ ] Add API interceptor
- [ ] Configure Vercel project
- [ ] Deploy and test
- [ ] Update CORS on backend

### **Day 4: Test & Secure**
- [ ] Test login/register
- [ ] Test course enrollment
- [ ] Test quiz taking
- [ ] Test payments (sandbox)
- [ ] Update default passwords
- [ ] Review security checklist

### **Day 5: Go Live!**
- [ ] Announce to users
- [ ] Monitor error logs
- [ ] Gather feedback

---

## 🔧 **Troubleshooting**

### **Backend won't start on Render:**
- Check logs in Render dashboard
- Verify all environment variables set
- Database connection string correct?
- Port set to `8080` (Render default)

### **Frontend shows CORS errors:**
- Update `ALLOWED_ORIGINS` in Render
- Redeploy backend
- Clear browser cache

### **Database migrations fail:**
- Run them manually in Neon SQL Editor
- Check PostgreSQL version compatibility
- Verify connection string has `?sslmode=require`

### **Build fails on Vercel:**
- Check Node version (18.x required)
- Run `npm install` locally first
- Check build logs for errors

---

## 📞 **Support Resources**

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## 🎉 **After Deployment**

### **Share Your Platform:**

Get your live URLs:
```
Frontend: https://codeless-platform.vercel.app
Backend API: https://codeless-backend.onrender.com
GitHub: https://github.com/YOUR_USERNAME/codeless-elearning-platform
```

**Share with:**
- Portfolio
- LinkedIn
- Resume
- Friends/Family (beta testers)

---

## 🔄 **Continuous Deployment**

After initial setup:
1. Make changes locally
2. Commit: `git commit -am "Add new feature"`
3. Push: `git push`
4. **Auto-deploys!** ✨
   - Vercel rebuilds frontend (2-3 min)
   - Render rebuilds backend (5-8 min)

---

**Ready to deploy?** Start with Phase 1! 🚀

