# 🗂️ Cloudinary Integration - File Reference

This document lists all files that use Cloudinary environment variables.

---

## 📋 Files That Read Cloudinary Environment Variables

### 1. **`.env`** (Local Development)
**Location**: `backend/codeless-backend/.env`  
**Purpose**: Stores your actual Cloudinary credentials locally  
**Git Status**: ❌ Not committed (in `.gitignore`)

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Action Required**: ✏️ Replace placeholders with your real credentials from Cloudinary dashboard.

---

### 2. **`application.yml`** (Spring Boot Config)
**Location**: `backend/codeless-backend/src/main/resources/application.yml`  
**Purpose**: Maps environment variables to Spring properties  
**Git Status**: ✅ Committed (no secrets)

```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME:demo}
  api-key: ${CLOUDINARY_API_KEY:}
  api-secret: ${CLOUDINARY_API_SECRET:}
```

**How it works**:
- `${CLOUDINARY_CLOUD_NAME:demo}` reads from env var, defaults to `demo` if not set
- Spring Boot automatically loads `.env` file on startup
- These properties are injected into `CloudinaryConfig.java`

**Action Required**: ✅ Already configured correctly, no changes needed.

---

### 3. **`CloudinaryConfig.java`** (Bean Configuration)
**Location**: `backend/codeless-backend/src/main/java/com/codeless/backend/config/CloudinaryConfig.java`  
**Purpose**: Creates Cloudinary bean from environment variables  
**Git Status**: ✅ Committed (no secrets)

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

**How it works**:
- `@Value` annotations inject properties from `application.yml`
- Creates a `Cloudinary` bean that other services can use
- `secure: true` forces HTTPS URLs

**Action Required**: ✅ Already configured correctly, no changes needed.

---

### 4. **`CloudinaryService.java`** (Upload Logic)
**Location**: `backend/codeless-backend/src/main/java/com/codeless/backend/service/CloudinaryService.java`  
**Purpose**: Handles image uploads to Cloudinary  
**Git Status**: ✅ Committed (no secrets)

```java
@Service
@RequiredArgsConstructor
public class CloudinaryService {
    
    private final Cloudinary cloudinary; // Injected from CloudinaryConfig
    
    public String uploadCourseImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap(
                "folder", "courses",
                "resource_type", "image",
                "quality", "auto:good",
                "width", 1200,
                "height", 630,
                "crop", "fill"
            ));
        return (String) uploadResult.get("url");
    }
}
```

**How it works**:
- Injects `Cloudinary` bean (which has credentials)
- Uploads images to specific folders (`courses`, `avatars`)
- Returns secure HTTPS URL

**Action Required**: ✅ Already configured correctly, no changes needed.

---

### 5. **`AdminCoursesController.java`** (Upload Endpoint)
**Location**: `backend/codeless-backend/src/main/java/com/codeless/backend/web/api/admin/AdminCoursesController.java`  
**Purpose**: REST API endpoint for course image upload  
**Git Status**: ✅ Committed (no secrets)

```java
@RestController
@RequestMapping("/api/admin/courses")
public class AdminCoursesController {
    
    private final CloudinaryService cloudinaryService;
    
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadCourseImage(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = cloudinaryService.uploadCourseImage(file);
        course.setImageUrl(imageUrl);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
}
```

**How it works**:
- Receives image file from frontend
- Calls `CloudinaryService` to upload
- Saves returned URL to database

**Action Required**: ✅ Already configured correctly, no changes needed.

---

## 🔄 Data Flow

```
1. You add credentials to .env
        ↓
2. Spring Boot loads .env on startup
        ↓
3. application.yml reads ${CLOUDINARY_CLOUD_NAME}
        ↓
4. CloudinaryConfig.java injects @Value annotations
        ↓
5. Cloudinary bean is created with credentials
        ↓
6. CloudinaryService.java uses the bean
        ↓
7. AdminCoursesController.java calls the service
        ↓
8. Image uploaded to Cloudinary CDN
        ↓
9. HTTPS URL returned and saved to database
```

---

## ✅ Summary

| File | Contains Secrets? | In Git? | Action Needed |
|------|------------------|---------|---------------|
| `.env` | ✅ YES | ❌ NO | ✏️ Add your credentials |
| `env.example` | ❌ NO | ✅ YES | ✅ Template only |
| `application.yml` | ❌ NO | ✅ YES | ✅ Already configured |
| `CloudinaryConfig.java` | ❌ NO | ✅ YES | ✅ Already configured |
| `CloudinaryService.java` | ❌ NO | ✅ YES | ✅ Already configured |
| `AdminCoursesController.java` | ❌ NO | ✅ YES | ✅ Already configured |

---

## 🎯 What You Need To Do

**Only 1 thing**: Update `.env` with your Cloudinary credentials!

```bash
# Open this file:
backend/codeless-backend/.env

# Replace these 3 lines:
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**Everything else is already configured!** 🎉

---

## 🔒 Security Notes

- `.env` is in `.gitignore` - your secrets are safe
- `application.yml` has safe defaults (`demo` cloud)
- All secrets stay on backend (never exposed to frontend)
- Production uses Render environment variables (not `.env`)

---

**Ready when you are!** Just paste your credentials and run `mvn spring-boot:run` 🚀

