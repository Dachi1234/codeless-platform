# 📸 Media Upload System (Cloudinary CDN)

**Status**: ✅ Fully Implemented (Oct 10, 2025)  
**Version**: 1.0  
**Provider**: Cloudinary

---

## Overview

The Media Upload System integrates with Cloudinary CDN to handle image uploads for course thumbnails. Images are automatically optimized, resized, and hosted on Cloudinary's global CDN for fast delivery.

---

## Features

### ✅ **Core Functionality**
- Course image upload (Admin only)
- File validation (type, size)
- Real-time preview
- Auto-resize to 1200x630px (16:9 ratio)
- Quality optimization (`auto:good`)
- CDN hosting (global delivery)
- Remove/replace images

### ✅ **Validation**
- File type: Images only (JPG, PNG, GIF, WebP)
- File size: Maximum 5MB
- Client-side validation
- Server-side validation

### ✅ **Optimization**
- Auto-resize: 1200x630px (no cropping, limit only)
- Quality: `auto:good` (Cloudinary smart compression)
- Format: Original format preserved
- Responsive: Multiple sizes generated automatically

---

## Architecture

### **Provider: Cloudinary**

**Why Cloudinary?**
- ✅ Free tier: 25GB storage, 25GB bandwidth/month
- ✅ Global CDN (fast delivery worldwide)
- ✅ Automatic optimization (WebP, AVIF, etc.)
- ✅ Image transformations on-the-fly
- ✅ Media management dashboard
- ✅ Java SDK available

**Alternatives Considered:**
- AWS S3 (more complex setup)
- Firebase Storage (tighter Google integration)
- Imgur (not designed for production apps)

---

## Backend API

### **Endpoint**

#### Upload Course Image
```http
POST /api/admin/courses/{courseId}/upload-image
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

file: [binary image data]
```

**Response (Success):**
```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123456/courses/abc-def-123.jpg",
  "message": "Image uploaded successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "File must be an image (got: application/pdf)"
}
```

**Status Codes:**
- `200 OK` - Upload successful
- `400 Bad Request` - Invalid file (type/size)
- `401 Unauthorized` - Not logged in
- `403 Forbidden` - Not admin
- `404 Not Found` - Course not found
- `500 Internal Server Error` - Cloudinary error

---

## Backend Implementation

### **Dependencies**

**Maven (`pom.xml`):**
```xml
<!-- Cloudinary SDK -->
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.36.0</version>
</dependency>
```

### **Configuration**

**`application.yml`:**
```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME:demo}
  api-key: ${CLOUDINARY_API_KEY:}
  api-secret: ${CLOUDINARY_API_SECRET:}
```

**Environment Variables:**
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - API key from dashboard
- `CLOUDINARY_API_SECRET` - API secret (keep secure!)

### **Files Structure**

```
backend/codeless-backend/src/main/java/com/codeless/backend/
├── config/
│   └── CloudinaryConfig.java           # Spring Bean configuration
├── service/
│   └── CloudinaryService.java          # Upload/delete logic
└── web/api/admin/
    └── AdminCoursesController.java     # REST endpoint
```

### **Key Classes**

#### **CloudinaryConfig**
```java
@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }
}
```

#### **CloudinaryService**
```java
@Service
public class CloudinaryService {
    public String uploadCourseImage(MultipartFile file) throws IOException {
        // Validate file
        // Upload to Cloudinary with transformations
        // Return secure URL
    }

    public boolean deleteImage(String publicId) {
        // Delete from Cloudinary
    }

    public String extractPublicId(String url) {
        // Parse public ID from Cloudinary URL
    }
}
```

### **Upload Flow**

1. **Validate File**: Check type (image/*) and size (<5MB)
2. **Generate Unique ID**: UUID for filename
3. **Upload to Cloudinary**:
   - Folder: `courses/`
   - Width: 1200px (limit)
   - Height: 630px (limit)
   - Crop: `limit` (no actual cropping)
   - Quality: `auto:good`
4. **Get Secure URL**: HTTPS URL from Cloudinary
5. **Update Database**: Save URL to `course.imageUrl`
6. **Return Response**: URL and success message

---

## Frontend Implementation

### **Component: Course Editor**

**File**: `frontend/src/app/pages/admin/course-editor/`

**Features:**
- Hidden file input (`<input type="file">`)
- "Choose Image" button (opens file picker)
- Real-time preview (before upload)
- "Upload Image" button (sends to backend)
- "Remove Image" button (clears selection)
- Progress indicator (uploading state)
- Validation messages

### **UI Components**

```html
<!-- Image Preview -->
<div class="image-preview" *ngIf="imagePreview">
  <img [src]="imagePreview" alt="Preview">
  <button class="btn-remove-image" (click)="removeImage()">
    ✕
  </button>
</div>

<!-- Upload Controls -->
<input type="file" #fileInput accept="image/*" (change)="onFileSelected($event)" hidden>
<button (click)="fileInput.click()">Choose Image</button>
<button (click)="uploadImage()" *ngIf="selectedFile" [disabled]="uploadingImage">
  {{ uploadingImage ? 'Uploading...' : 'Upload Image' }}
</button>
```

### **TypeScript Logic**

```typescript
onFileSelected(event: Event): void {
  const file = input.files[0];
  
  // Validate type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image');
    return;
  }
  
  // Validate size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be less than 5MB');
    return;
  }
  
  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    this.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);
}

uploadImage(): void {
  const formData = new FormData();
  formData.append('file', this.selectedFile);
  
  this.http.post(`/api/admin/courses/${courseId}/upload-image`, formData)
    .subscribe({
      next: (response) => {
        this.form.imageUrl = response.imageUrl;
        alert('Image uploaded successfully!');
      },
      error: (err) => {
        alert('Upload failed: ' + err.error.error);
      }
    });
}
```

---

## User Flow

### **Admin Uploads Course Image**

1. **Navigate to Course Editor**:
   - Admin → Courses → Edit Course

2. **See "Course Image" Section**:
   - Currently shows existing image (if any)
   - Or placeholder

3. **Click "Choose Image"**:
   - File picker opens
   - Select JPG/PNG (< 5MB)

4. **Preview Appears**:
   - Image shown in 16:9 preview box
   - Can remove and choose different image

5. **Click "Upload Image"**:
   - File sent to backend
   - Backend uploads to Cloudinary
   - Progress indicator shown

6. **Success**:
   - Alert: "Image uploaded successfully!"
   - Preview updated with Cloudinary URL
   - Database updated

7. **View Course**:
   - Course card shows new image
   - Image loaded from Cloudinary CDN

---

## Cloudinary Setup

### **1. Create Account**

1. Go to: https://cloudinary.com
2. Sign up (free tier)
3. Verify email

### **2. Get Credentials**

1. Dashboard → Account Details
2. Copy:
   - **Cloud Name** (e.g., `democloud`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123`)

### **3. Configure Local Environment**

**PowerShell:**
```powershell
$env:CLOUDINARY_CLOUD_NAME="your_cloud_name"
$env:CLOUDINARY_API_KEY="your_api_key"
$env:CLOUDINARY_API_SECRET="your_api_secret"
```

**Or use script:**
```powershell
# Edit backend/codeless-backend/set-env.ps1
.\set-env.ps1
mvn spring-boot:run
```

### **4. Configure Production (Render)**

1. Render Dashboard → Backend Service
2. Environment tab
3. Add variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Save (auto-deploys)

---

## Image Transformations

### **Default Upload**
```
Width: 1200px (limit, no upscale)
Height: 630px (limit, no upscale)
Crop: limit (maintains aspect ratio)
Quality: auto:good (Cloudinary smart compression)
Format: Original (JPG stays JPG, PNG stays PNG)
```

### **Cloudinary URL Structure**
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/v{version}/{public_id}.{format}

Example:
https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_limit,q_auto:good/v1697123456/courses/abc-def-123.jpg
```

### **Custom Transformations (Future)**

You can add custom transformations by modifying the upload parameters:

```java
// Square thumbnail (300x300)
"transformation", ObjectUtils.asMap(
    "width", 300,
    "height", 300,
    "crop", "fill",
    "gravity", "face"
)

// Blur background
"transformation", ObjectUtils.asMap(
    "effect", "blur:1000"
)

// Watermark
"transformation", ObjectUtils.asMap(
    "overlay", "logo",
    "gravity", "south_east"
)
```

---

## Storage & Bandwidth

### **Free Tier Limits**
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25 credits/month
- **Image count**: Unlimited

### **Estimations**
- Average course image: ~500 KB (after optimization)
- 25 GB = ~50,000 images
- 25 GB bandwidth = ~50,000 views/month (if all images viewed)

**Recommendation**: Free tier is sufficient for MVP and early growth.

---

## Security Considerations

### **Access Control**
✅ Upload endpoint requires ADMIN role  
✅ API keys stored as environment variables (never in code)  
✅ Cloudinary API secret never exposed to frontend

### **File Validation**
✅ Server-side type checking (MIME type)  
✅ Size limit (5MB)  
✅ No executable files allowed

### **CDN Security**
✅ HTTPS only (secure URLs)  
✅ Signed URLs (optional, not implemented)  
✅ Domain restrictions (can configure in Cloudinary)

---

## Troubleshooting

### **"Unauthorized" Error**
**Cause**: Invalid Cloudinary credentials  
**Solution**: 
1. Check environment variables are set correctly
2. Verify credentials in Cloudinary dashboard
3. Restart backend after setting env vars

### **"File must be an image" Error**
**Cause**: Non-image file selected  
**Solution**: Select JPG, PNG, GIF, or WebP

### **"Image must be less than 5MB" Error**
**Cause**: File too large  
**Solution**: 
1. Compress image using online tools
2. Reduce resolution
3. Or increase limit in code

### **Images Not Displaying**
**Cause**: CORS or URL issue  
**Solution**:
1. Check browser console for errors
2. Verify URL in database is valid
3. Check Cloudinary dashboard → Media Library
4. Enable CORS in Cloudinary settings (if needed)

### **Upload Fails with 500 Error**
**Cause**: Cloudinary service error  
**Solution**:
1. Check Cloudinary service status
2. Verify credentials
3. Check backend logs for details

---

## Future Enhancements

### **Planned Features**
- [ ] Multiple images per course (gallery)
- [ ] Image cropping UI (frontend)
- [ ] User avatar uploads
- [ ] Video upload support
- [ ] Bulk upload (multiple files)
- [ ] Image tags/categorization
- [ ] Search images by tags

### **Optimizations**
- [ ] Lazy loading for images
- [ ] Progressive image loading
- [ ] Responsive images (srcset)
- [ ] WebP format conversion
- [ ] Image compression presets

---

## Related Documentation

- [CLOUDINARY_SETUP.md](../setup/CLOUDINARY_SETUP.md) - Detailed setup guide
- [CURRENT_STATUS.md](../../CURRENT_STATUS.md) - Project status
- [Cloudinary Documentation](https://cloudinary.com/documentation) - Official docs

---

## API Documentation

Full Swagger documentation available at:
```
http://localhost:8080/swagger-ui.html
```

Look for: **"Admin - Courses"** → **"Upload course image"**

---

**Last Updated**: October 10, 2025  
**Author**: AI Assistant  
**Version**: 1.0

