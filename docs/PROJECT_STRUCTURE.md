# 📁 Project Structure & Organization

**Last Updated**: October 12, 2025  
**Status**: ✅ Organized and Clean

---

## 🎯 **Structure Philosophy**

All documentation lives in `docs/` with clear categorization.  
Only essential project files remain in root.

---

## 📂 **Root Directory**

```
Codeless_Web/
├── README.md                    # Main project overview
├── CURRENT_STATUS.md            # Current project status and progress
├── cloudbuild.yaml              # Cloud Build CI/CD configuration
├── cloud-run-setup.ps1          # Manual Cloud Run deployment (Windows)
├── cloud-run-setup.sh           # Manual Cloud Run deployment (Linux/Mac)
├── vercel.json                  # Vercel frontend configuration
├── archive/                     # Historical documentation (preserved)
├── backend/                     # Spring Boot backend
├── frontend/                    # Angular frontend
└── docs/                        # All active documentation
```

---

## 📚 **Documentation Structure** (`docs/`)

### **`docs/architecture/`** - System Design
- `TECHNICAL_ARCHITECTURE.md` - Overall system architecture
- `SECURITY_AUDIT_REPORT.md` - Security review and audit

### **`docs/features/`** - Feature Documentation
- `ADMIN_PANEL.md` - Admin features
- `ARTICLE_BUILDER.md` - Article content editor
- `CLOUDINARY_FILES.md` - Media upload system
- `CURRICULUM_BUILDER.md` - Course curriculum management
- `LIVE_COURSES.md` - Live course features (sessions, assignments)
- `MEDIA_UPLOAD.md` - Media management
- `PROGRESS_TRACKING.md` - Student progress system
- `QUIZ_SYSTEM.md` - Quiz builder and taker
- `REVIEW_SYSTEM.md` - Course reviews and ratings

### **`docs/planning/`** - Roadmap & Planning
- `BACKLOG.md` - General product backlog
- `LIVE_COURSES_BACKLOG.md` - Live courses future enhancements
- `PLACEHOLDER_FUNCTIONALITY.md` - Temporary implementations
- `PRIORITY_ROADMAP.md` - Feature priorities

### **`docs/setup/`** - Setup & Deployment
- `CLOUD_RUN_CI_CD.md` - CI/CD pipeline documentation
- `CLOUD_RUN_DEPLOYMENT.md` - Cloud Run setup guide
- `CLOUDINARY_SETUP.md` - Cloudinary configuration
- `DEPLOYMENT_GUIDE.md` - Legacy Render deployment (archived)
- `ENV_SETUP_GUIDE.md` - Environment variables guide
- `MANUAL_TESTING_GUIDE.md` - Complete testing checklist
- `PRE_PUSH_CHECKLIST.md` - Pre-deployment checklist
- `SETUP_INSTRUCTIONS.md` - Local development setup

### **`docs/updates/`** - Release Notes & Progress
- `2025-10-10_QUICK_WINS.md` - Quick wins batch updates
- `2025-10-10_QUIZ_UX.md` - Quiz improvements
- `2025-10-11_LIVE_COURSES_COMPLETE.md` - Live courses release
- `CLOUDINARY_SETUP_COMPLETE.md` - Cloudinary integration
- `FEATURES_RECAP_OCT_11.md` - Feature recap
- `LIVE_COURSES_BACKEND_COMPLETE.md` - Backend completion
- `LIVE_COURSES_COMPLETE.md` - Full feature completion
- `LIVE_COURSES_PROGRESS_OCT_11.md` - Development progress
- `LIVE_COURSES_TESTING_GUIDE.md` - Testing documentation
- `LIVE_COURSES_UI_PROGRESS.md` - UI development progress

---

## 🗂️ **Archive Directory**

Historical documentation preserved for reference:
- Session summaries from development
- Architecture iterations
- Feature completion logs
- Bug fix histories
- Planning documents from early phases

**Purpose**: Reference only, not actively maintained.

---

## 🚀 **Deployment Files**

### **Cloud Run (Current)**
- `cloudbuild.yaml` - Cloud Build configuration
- `cloud-run-setup.ps1` - Windows deployment script
- `cloud-run-setup.sh` - Linux/Mac deployment script
- `backend/codeless-backend/Dockerfile.cloudrun` - Production Docker image

### **Vercel (Frontend)**
- `vercel.json` (root) - Vercel configuration
- `frontend/vercel.json` - Frontend-specific config

### **Documentation**
- `docs/setup/CLOUD_RUN_CI_CD.md` - Automated CI/CD
- `docs/setup/CLOUD_RUN_DEPLOYMENT.md` - Manual deployment

---

## 🧹 **Recently Cleaned Up** (Oct 12, 2025)

### **Files Deleted (Outdated)**
- ❌ `CLOUD_RUN_FILES_README.md` - Render parallel deployment info
- ❌ `CLOUD_RUN_QUICK_START.md` - Outdated quick start
- ❌ `FEATURES_RECAP_OCT_11.md` - Duplicate (moved to docs/)
- ❌ `PUSH_READY_SUMMARY.md` - Superseded by CURRENT_STATUS.md
- ❌ `REORGANIZATION_GUIDE.md` - Temporary file
- ❌ `reorganize-docs.ps1` - Temporary script
- ❌ `docs/setup/ENV_VS_RENDER.md` - Render-specific (no longer used)

### **Files Moved to `docs/`**
- ✅ `PLACEHOLDER_FUNCTIONALITY.md` → `docs/planning/`
- ✅ `PRE_PUSH_CHECKLIST.md` → `docs/setup/`
- ✅ `MANUAL_TESTING_GUIDE.md` → `docs/setup/`
- ✅ `DATABASE_SCRIPTS_REFERENCE.md` → `archive/`

### **Files Updated**
- ✅ `CURRENT_STATUS.md` - Updated to Cloud Run
- ✅ `README.md` - Updated deployment info
- ✅ `docs/setup/DEPLOYMENT_GUIDE.md` - Added deprecation notice

---

## 📋 **How to Find Documentation**

### **Need to know...**

**"How is the system architected?"**  
→ `docs/architecture/TECHNICAL_ARCHITECTURE.md`

**"How do I deploy the backend?"**  
→ `docs/setup/CLOUD_RUN_CI_CD.md`

**"How does [feature] work?"**  
→ `docs/features/[FEATURE].md`

**"What's the current status?"**  
→ `CURRENT_STATUS.md` (root)

**"What's planned next?"**  
→ `docs/planning/BACKLOG.md`

**"How do I set up locally?"**  
→ `docs/setup/SETUP_INSTRUCTIONS.md`

**"What changed recently?"**  
→ `docs/updates/` (sorted by date)

---

## 🎯 **File Naming Conventions**

### **Documentation Files**
- **UPPER_CASE.md** - Major documents (status, guides, architecture)
- **lowercase.md** - Standard documentation (setup, features)
- **YYYY-MM-DD_description.md** - Dated updates in `docs/updates/`

### **Code Files**
- **PascalCase.java** - Java classes
- **kebab-case.ts** - TypeScript/Angular files
- **kebab-case.component.html** - Component templates
- **kebab-case.component.scss** - Component styles

---

## ✅ **Benefits of This Structure**

1. **Clear Separation**: Active docs vs historical archive
2. **Easy Discovery**: Logical folder structure
3. **Clean Root**: Only essential files
4. **Dated Updates**: Chronological progress tracking
5. **Feature Docs**: One file per major feature
6. **No Duplication**: Single source of truth
7. **Deployment Clarity**: Cloud Run is the standard

---

## 🔄 **Maintenance Guidelines**

### **When Creating New Docs**
1. Decide category: architecture, features, planning, setup, or updates
2. Use clear naming convention
3. Add to this index if it's a major document
4. Cross-reference related docs

### **When Archiving Docs**
1. Move to `archive/` folder
2. Keep original filename
3. No need to update (historical record)

### **When Updating Docs**
1. Update "Last Updated" date
2. Keep old versions in archive if major changes
3. Update cross-references in related docs

---

## 📊 **Documentation Stats**

| Category | Count | Purpose |
|----------|-------|---------|
| **Architecture** | 2 | System design |
| **Features** | 9 | Feature documentation |
| **Planning** | 4 | Roadmap & backlog |
| **Setup** | 8 | Deployment & setup |
| **Updates** | 10 | Release notes |
| **Root** | 2 | Status & overview |
| **Archive** | 40+ | Historical reference |

**Total Active Docs**: 35  
**Total Archived**: 40+

---

## 🎉 **Summary**

The project now has a **clean, organized structure** with:
- ✅ All docs properly categorized
- ✅ No duplication
- ✅ Clear deployment path (Cloud Run)
- ✅ Easy navigation
- ✅ Historical preservation
- ✅ Single source of truth

**Everything has its place!** 🚀

