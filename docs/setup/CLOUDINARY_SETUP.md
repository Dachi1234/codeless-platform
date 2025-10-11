# 🖼️ Cloudinary Setup Guide

## For Local Development

### Option 1: PowerShell Environment Variables (Recommended)

1. **Get Cloudinary Credentials:**
   - Sign up: https://cloudinary.com (free tier)
   - Dashboard → Account Details
   - Copy: Cloud Name, API Key, API Secret

2. **Set Environment Variables in PowerShell:**
   ```powershell
   $env:CLOUDINARY_CLOUD_NAME="your_cloud_name"
   $env:CLOUDINARY_API_KEY="your_api_key"
   $env:CLOUDINARY_API_SECRET="your_api_secret"
   ```

3. **Run Backend:**
   ```powershell
   mvn spring-boot:run
   ```

### Option 2: Create `set-env.ps1` Script

1. **Copy `set-env.ps1.example` to `set-env.ps1`**

2. **Edit `set-env.ps1` with your credentials:**
   ```powershell
   $env:CLOUDINARY_CLOUD_NAME="your_actual_cloud_name"
   $env:CLOUDINARY_API_KEY="your_actual_api_key"
   $env:CLOUDINARY_API_SECRET="your_actual_api_secret"
   ```

3. **Run before starting backend:**
   ```powershell
   .\set-env.ps1
   mvn spring-boot:run
   ```

### Option 3: IDE Run Configuration

**IntelliJ IDEA:**
- Edit Run Configuration
- Environment Variables:
  - `CLOUDINARY_CLOUD_NAME=your_cloud_name`
  - `CLOUDINARY_API_KEY=your_api_key`
  - `CLOUDINARY_API_SECRET=your_api_secret`

---

## For Production (Render)

1. Go to: https://dashboard.render.com
2. Select your backend service
3. **Environment** tab
4. Add variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
5. Save (auto-deploys)

---

## Testing Image Upload

1. **Start backend** (with env vars set)
2. **Start frontend**: `cd frontend && npm start`
3. **Login as admin**
4. **Go to**: Admin → Courses → Edit any course
5. **Upload an image** in the "Course Image" section
6. **Check console** for success message
7. **View course** to see the uploaded image

---

## Default Behavior

If no credentials are set:
- **Cloud Name**: Defaults to `demo` (Cloudinary's demo cloud)
- **API Key/Secret**: Empty
- **Result**: Limited functionality, images won't persist

---

## Security Notes

⚠️ **NEVER commit credentials to Git!**

Files already in `.gitignore`:
- `.env`
- `.env.local`
- `set-env.ps1`

Always use environment variables for sensitive data.

---

## Troubleshooting

### "Unauthorized" Error
- Check credentials are correct
- Check environment variables are set
- Restart backend after setting env vars

### "Invalid URL" Error
- Check image file is valid (JPG/PNG)
- Check file size < 5MB
- Check course is saved before uploading

### Images Not Showing
- Check browser console for errors
- Check Cloudinary dashboard for uploads
- Check CORS is enabled in Cloudinary settings

