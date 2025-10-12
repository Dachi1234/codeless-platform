# 📚 Codeless Platform Documentation

Welcome to the organized documentation for the Codeless E-Learning Platform!

**📖 Quick Reference**: See [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) for complete organization guide.

---

## 📁 **Documentation Structure**

### **Root Level (Quick Access)**
| File | Purpose |
|------|---------|
| [`README.md`](../README.md) | Project overview and quick start |
| [`CURRENT_STATUS.md`](../CURRENT_STATUS.md) | Current feature status and progress |
| [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) 🆕 | Complete project organization guide |

---

### **🛠️ Setup & Deployment** (`docs/setup/`)
| File | Description |
|------|-------------|
| [`SETUP_INSTRUCTIONS.md`](setup/SETUP_INSTRUCTIONS.md) | How to run locally (backend + frontend) |
| [`CLOUD_RUN_CI_CD.md`](setup/CLOUD_RUN_CI_CD.md) ⭐ | CI/CD pipeline with Cloud Build (current) |
| [`CLOUD_RUN_DEPLOYMENT.md`](setup/CLOUD_RUN_DEPLOYMENT.md) ⭐ | Manual Cloud Run deployment guide |
| [`CLOUDINARY_SETUP.md`](setup/CLOUDINARY_SETUP.md) | Configure Cloudinary for image uploads |
| [`ENV_SETUP_GUIDE.md`](setup/ENV_SETUP_GUIDE.md) | Local environment variables setup (.env file) |
| [`MANUAL_TESTING_GUIDE.md`](setup/MANUAL_TESTING_GUIDE.md) 🆕 | Complete testing checklist |
| [`PRE_PUSH_CHECKLIST.md`](setup/PRE_PUSH_CHECKLIST.md) 🆕 | Pre-deployment security checklist |
| [`DEPLOYMENT_GUIDE.md`](setup/DEPLOYMENT_GUIDE.md) | Legacy Render deployment (archived) |

---

### **🏗️ Architecture** (`docs/architecture/`)
| File | Description |
|------|-------------|
| [`TECHNICAL_ARCHITECTURE.md`](architecture/TECHNICAL_ARCHITECTURE.md) | System design, tech stack, architecture decisions |
| [`SECURITY_AUDIT_REPORT.md`](architecture/SECURITY_AUDIT_REPORT.md) | Security review and recommendations |

**What's Covered:**
- Frontend architecture (Angular 19, Standalone components)
- Backend architecture (Spring Boot 3, REST APIs)
- Database schema (PostgreSQL, 25+ tables)
- Authentication & Authorization (JWT, role-based)
- Deployment architecture (Vercel + Cloud Run + Neon)

---

### **✨ Features** (`docs/features/`)
| File | Description |
|------|-------------|
| [`QUIZ_SYSTEM.md`](features/QUIZ_SYSTEM.md) | Quiz builder + taker (4 question types) |
| [`PROGRESS_TRACKING.md`](features/PROGRESS_TRACKING.md) | Lesson & course progress tracking |
| [`CURRICULUM_BUILDER.md`](features/CURRICULUM_BUILDER.md) | Course curriculum management |
| [`ARTICLE_BUILDER.md`](features/ARTICLE_BUILDER.md) | TinyMCE article editor |
| [`ADMIN_PANEL.md`](features/ADMIN_PANEL.md) | Admin dashboard and management |
| [`LIVE_COURSES.md`](features/LIVE_COURSES.md) 🎉 **NEW** | Live sessions with Zoom, assignments & grading |
| [`REVIEW_SYSTEM.md`](features/REVIEW_SYSTEM.md) | Star ratings & text reviews for courses |
| [`MEDIA_UPLOAD.md`](features/MEDIA_UPLOAD.md) | Cloudinary CDN image upload system |
| [`CLOUDINARY_FILES.md`](features/CLOUDINARY_FILES.md) | Reference of all files using Cloudinary |

**What's Documented:**
- Feature overview and use cases
- Technical implementation details
- Database schema for each feature
- API endpoints
- UI/UX screenshots (if available)

---

### **📋 Planning** (`docs/planning/`)
| File | Description |
|------|-------------|
| [`PRIORITY_ROADMAP.md`](planning/PRIORITY_ROADMAP.md) | Current priorities and timeline |
| [`BACKLOG.md`](planning/BACKLOG.md) | Feature backlog and future ideas |
| [`LIVE_COURSES_BACKLOG.md`](planning/LIVE_COURSES_BACKLOG.md) | Live courses future enhancements |
| [`PLACEHOLDER_FUNCTIONALITY.md`](planning/PLACEHOLDER_FUNCTIONALITY.md) 🆕 | Temporary implementations tracker |

---

### **📅 Updates** (`docs/updates/`)
Chronological log of major updates and changes.

| File | Date | Description |
|------|------|-------------|
| [`CLOUDINARY_SETUP_COMPLETE.md`](updates/CLOUDINARY_SETUP_COMPLETE.md) ⭐ NEW | Oct 10, 2025 | Cloudinary .env setup summary |
| [`2025-10-10_QUICK_WINS.md`](updates/2025-10-10_QUICK_WINS.md) | Oct 10, 2025 | Image upload + Reviews + Live events fix |
| [`2025-10-10_QUIZ_UX.md`](updates/2025-10-10_QUIZ_UX.md) | Oct 10, 2025 | Quiz improvements + UX enhancements |
| [`2025-10-09_DEPLOYMENT.md`](updates/2025-10-09_DEPLOYMENT.md) | Oct 9, 2025 | Full production deployment |
| [`2025-10-08_CART_PAYPAL.md`](updates/2025-10-08_CART_PAYPAL.md) | Oct 8, 2025 | Cart + PayPal integration |

---

## 🗂️ **Archive**
Old and obsolete documentation is moved to [`archive/`](../archive/) for reference.

---

## 🔍 **Finding What You Need**

### **I want to...**

**...run the project locally**
→ See [`docs/setup/SETUP_INSTRUCTIONS.md`](setup/SETUP_INSTRUCTIONS.md)

**...deploy to production**
→ See [`docs/setup/CLOUD_RUN_CI_CD.md`](setup/CLOUD_RUN_CI_CD.md) (current deployment)

**...understand the architecture**
→ See [`docs/architecture/TECHNICAL_ARCHITECTURE.md`](architecture/TECHNICAL_ARCHITECTURE.md)

**...learn about a specific feature**
→ See [`docs/features/`](features/)

**...know what's working and what's not**
→ See [`CURRENT_STATUS.md`](../CURRENT_STATUS.md)

**...see what's planned next**
→ See [`docs/planning/PRIORITY_ROADMAP.md`](planning/PRIORITY_ROADMAP.md)

**...review recent changes**
→ See [`docs/updates/`](updates/)

---

## 📊 **Documentation Status**

| Category | Files | Status |
|----------|-------|--------|
| Setup | 8 | ✅ Complete |
| Architecture | 2 | ✅ Complete |
| Features | 9 | ✅ Complete |
| Planning | 4 | ✅ Complete |
| Updates | 10+ | 🔄 Ongoing |

**Last Major Update**: October 12, 2025 - Project restructuring and Cloud Run migration complete

---

## 🤝 **Contributing to Docs**

When adding new documentation:

1. **Feature docs** → `docs/features/FEATURE_NAME.md`
2. **Update logs** → `docs/updates/YYYY-MM-DD_TOPIC.md`
3. **Architecture changes** → Update `docs/architecture/TECHNICAL_ARCHITECTURE.md`
4. **Status updates** → Update `CURRENT_STATUS.md`

---

**📖 Happy documenting!**

