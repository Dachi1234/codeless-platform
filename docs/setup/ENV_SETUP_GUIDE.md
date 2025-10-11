# 🔧 Environment Variables Setup Guide

## 📁 File Location
`backend/codeless-backend/.env`

This file has been created for you and is **already in `.gitignore`** (safe from Git commits).

---

## 🚀 Quick Start

### **Step 1: Get Your Cloudinary Credentials**

1. Go to: https://console.cloudinary.com/
2. Log in to your account
3. On the dashboard, find **"Product Environment Credentials"** section
4. Copy these 3 values:
   - **Cloud Name** (e.g., `democloud123`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### **Step 2: Update `.env` File**

Open `backend/codeless-backend/.env` and replace the placeholders:

```bash
# Before (placeholders):
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# After (your actual credentials):
CLOUDINARY_CLOUD_NAME=democloud123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### **Step 3: Run Backend**

```powershell
cd backend\codeless-backend
mvn spring-boot:run
```

**That's it!** Spring Boot automatically loads `.env` on startup. ✅

---

## 📋 How It Works

### **Files Involved:**

1. **`.env`** (Local environment variables)
   - Contains your **secret** credentials
   - ❌ Never committed to Git (in `.gitignore`)
   - ✅ Automatically loaded by Spring Boot

2. **`application.yml`** (Spring Boot configuration)
   - Reads from environment variables using `${CLOUDINARY_CLOUD_NAME}`
   - Has safe defaults (e.g., `demo` cloud for testing)
   - ✅ Committed to Git (no secrets here)

3. **`CloudinaryConfig.java`** (Java configuration)
   - Uses `@Value` annotations to inject env vars
   - Creates Cloudinary bean for the app
   - ✅ Committed to Git (no secrets here)

### **Environment Variable Flow:**

```
.env file
    ↓
Spring Boot reads on startup
    ↓
application.yml uses ${CLOUDINARY_CLOUD_NAME}
    ↓
CloudinaryConfig.java injects @Value
    ↓
Cloudinary bean is created
    ↓
CloudinaryService uses it to upload images
```

---

## 🔒 Security Best Practices

### ✅ **DO:**
- Keep `.env` in `.gitignore` (already done)
- Use different credentials for local vs. production
- Rotate API secrets periodically
- Set Cloudinary upload presets to "unsigned" for frontend uploads (if needed)

### ❌ **DON'T:**
- Commit `.env` to Git
- Share your API Secret publicly
- Hardcode credentials in code
- Use production credentials in local development

---

## 🌐 Production Setup (Render)

For production deployment on Render:

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Click **"Environment"** tab
4. Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `CLOUDINARY_CLOUD_NAME` | Your cloud name | `democloud123` |
| `CLOUDINARY_API_KEY` | Your API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Your API secret | `abcdefg12345xyz` |

5. Click **"Save Changes"**
6. Render will auto-redeploy (wait ~2-3 minutes)
7. ✅ Done!

---

## 🧪 Testing

### **Test Locally:**

1. Start backend: `mvn spring-boot:run`
2. Check logs for:
   ```
   Cloudinary configured with cloud: your_cloud_name_here
   ```
   (Or no errors about Cloudinary)

3. Go to: http://localhost:4200/admin/courses
4. Edit any course
5. Upload an image
6. Should see "Image uploaded successfully!"
7. Check Cloudinary Dashboard → Media Library

### **Test in Production:**

1. Go to: https://codeless.digital/admin/courses
2. Edit a course
3. Upload an image
4. Should work!

---

## ❓ Troubleshooting

### **Error: "Cloudinary credentials not set"**
**Fix**: Check `.env` file exists and has correct values (no quotes, no spaces)

### **Error: "Invalid credentials"**
**Fix**: Copy-paste credentials again from Cloudinary dashboard (might have typo)

### **Error: "Unauthorized"**
**Fix**: 
- Local: Restart backend after updating `.env`
- Render: Check env vars saved correctly (green checkmark)

### **Images upload but show "demo" cloud URL**
**Fix**: Environment variables not loaded. Restart backend.

### **Backend won't start**
**Fix**: Check `.env` syntax:
```bash
# Correct:
CLOUDINARY_CLOUD_NAME=mycloud

# Wrong:
CLOUDINARY_CLOUD_NAME = "mycloud"  # No quotes, no spaces around =
```

---

## 📚 Related Files

- `.env` - Your local environment variables (create this)
- `env.example` - Template for reference
- `.gitignore` - Ensures `.env` is never committed
- `application.yml` - Spring Boot config (reads from env vars)
- `CloudinaryConfig.java` - Java bean configuration
- `CloudinaryService.java` - Image upload service

---

## ✨ Summary

1. ✅ `.env` file created with placeholders
2. ✅ Already in `.gitignore` (won't be committed)
3. ✅ Spring Boot auto-loads it on startup (no extra dependencies needed)
4. ✅ All config files already use environment variables
5. ⏳ **Just waiting for you to add your Cloudinary credentials!**

---

**Need help?** Check the console logs or ask! 🚀

