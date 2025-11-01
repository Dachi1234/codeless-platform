# Documentation Structure

This document outlines the organized documentation structure for the Discord bots project.

---

## 📁 Folder Structure

```
discord-bots/
├── README.md                           # Main project README
├── DOCUMENTATION_STRUCTURE.md          # This file
│
├── docs/                               # 📚 All documentation
│   ├── README.md                       # Documentation index
│   │
│   ├── setup/                          # 🚀 Setup & Deployment (6 files)
│   │   ├── GETTING_STARTED.md         # Introduction and overview
│   │   ├── QUICK_START.md             # 5-minute quickstart
│   │   ├── SETUP_GUIDE.md             # Full local setup guide
│   │   ├── CLOUD_RUN_DEPLOYMENT.md    # Cloud Run deployment
│   │   ├── NEON_CONNECTION_GUIDE.md   # Database connection setup
│   │   └── GIT_DEPLOYMENT_CHECKLIST.md # Pre-deployment checklist
│   │
│   ├── architecture/                   # 🏗️ Architecture & Design (3 files)
│   │   ├── ASYNC_WEBHOOK_PATTERN.md   # Sync/async webhook pattern
│   │   ├── ARCHITECTURE_CHANGE_SUMMARY.md # Architecture evolution
│   │   └── BOT_SPECIFIC_METRICS.md    # Agent-specific metrics design
│   │
│   ├── guides/                         # 📖 User Guides (3 files)
│   │   ├── PROJECT_TRACKING_GUIDE.md  # Project tracking system
│   │   ├── N8N_WORKFLOW_GUIDE.md      # n8n workflow integration
│   │   └── DATABASE_UPDATE_SUMMARY.md # Database schema guide
│   │
│   ├── migrations/                     # 🔄 Migration Guides (4 files)
│   │   ├── COMPLETED_DATABASE_UPDATES.md # Latest updates
│   │   ├── AGENT_TABLES_MIGRATION_GUIDE.md # Agent tables migration
│   │   ├── MULTI_BOT_MIGRATION.md     # Multi-bot migration
│   │   └── CHANGES_SUMMARY.md         # All changes summary
│   │
│   └── reference/                      # ⚡ Quick Reference (3 files)
│       ├── QUICK_REFERENCE.md         # Quick lookup card
│       ├── QUICK_ANSWERS.md           # Common Q&A
│       └── QUICK_CHECKLIST.md         # Quick checklist
│
├── sql/                                # Database migrations
│   ├── README.md
│   ├── 001_discord_schema.sql
│   ├── 002_add_student_profile_columns.sql
│   ├── 003_multi_bot_support.sql
│   ├── 004_bot_specific_tension_trust.sql
│   ├── 005_agent_dedicated_tables.sql
│   └── 006_project_tracking.sql
│
├── src/                                # Source code
│   ├── index.ts
│   ├── bot.ts
│   ├── config.ts
│   └── services/
│       ├── database.service.ts
│       └── n8n.service.ts
│
└── [other project files]
```

---

## 📚 Documentation Categories

### **1. Setup & Deployment** (`docs/setup/`)

**Purpose:** Help users set up and deploy the bot system

| File | Description | When to Use |
|------|-------------|-------------|
| **GETTING_STARTED.md** | Introduction and overview | First time reading about the project |
| **QUICK_START.md** | 5-minute quickstart | Want to get up and running fast |
| **SETUP_GUIDE.md** | Complete local setup | Setting up dev environment |
| **CLOUD_RUN_DEPLOYMENT.md** | Production deployment | Deploying to Google Cloud Run |
| **NEON_CONNECTION_GUIDE.md** | Database setup | Connecting to Neon PostgreSQL |
| **GIT_DEPLOYMENT_CHECKLIST.md** | Pre-deployment checklist | Before pushing to production |

### **2. Architecture & Design** (`docs/architecture/`)

**Purpose:** Explain system design and technical decisions

| File | Description | When to Use |
|------|-------------|-------------|
| **ASYNC_WEBHOOK_PATTERN.md** | Sync/async webhook pattern | Understanding bot-n8n communication |
| **ARCHITECTURE_CHANGE_SUMMARY.md** | Architecture evolution | Understanding design changes |
| **BOT_SPECIFIC_METRICS.md** | Agent metrics design | Understanding agent-specific data |

### **3. User Guides** (`docs/guides/`)

**Purpose:** How-to guides for using the system

| File | Description | When to Use |
|------|-------------|-------------|
| **PROJECT_TRACKING_GUIDE.md** | Project tracking system | Tracking student projects & deployments |
| **N8N_WORKFLOW_GUIDE.md** | n8n integration | Creating/updating n8n workflows |
| **DATABASE_UPDATE_SUMMARY.md** | Database schema reference | Understanding the database |

### **4. Migration Guides** (`docs/migrations/`)

**Purpose:** Database migration and upgrade guides

| File | Description | When to Use |
|------|-------------|-------------|
| **COMPLETED_DATABASE_UPDATES.md** | Latest updates (Nov 2025) | Most recent migration info |
| **AGENT_TABLES_MIGRATION_GUIDE.md** | Agent tables migration | Historical reference |
| **MULTI_BOT_MIGRATION.md** | Multi-bot migration | Historical reference |
| **CHANGES_SUMMARY.md** | All changes summary | Complete change history |

### **5. Quick Reference** (`docs/reference/`)

**Purpose:** Quick lookup materials

| File | Description | When to Use |
|------|-------------|-------------|
| **QUICK_REFERENCE.md** | API quick reference | Looking up common operations |
| **QUICK_ANSWERS.md** | Common Q&A | Troubleshooting issues |
| **QUICK_CHECKLIST.md** | Quick checklist | Verifying setup |

---

## 🎯 Finding the Right Document

### **"I want to..."**

| Goal | Document |
|------|----------|
| Get started from scratch | [docs/setup/GETTING_STARTED.md](docs/setup/GETTING_STARTED.md) |
| Set up locally in 5 minutes | [docs/setup/QUICK_START.md](docs/setup/QUICK_START.md) |
| Deploy to production | [docs/setup/CLOUD_RUN_DEPLOYMENT.md](docs/setup/CLOUD_RUN_DEPLOYMENT.md) |
| Understand the architecture | [docs/architecture/ASYNC_WEBHOOK_PATTERN.md](docs/architecture/ASYNC_WEBHOOK_PATTERN.md) |
| Create an n8n workflow | [docs/guides/N8N_WORKFLOW_GUIDE.md](docs/guides/N8N_WORKFLOW_GUIDE.md) |
| Track student projects | [docs/guides/PROJECT_TRACKING_GUIDE.md](docs/guides/PROJECT_TRACKING_GUIDE.md) |
| Run a database migration | [docs/migrations/COMPLETED_DATABASE_UPDATES.md](docs/migrations/COMPLETED_DATABASE_UPDATES.md) |
| Quick API reference | [docs/reference/QUICK_REFERENCE.md](docs/reference/QUICK_REFERENCE.md) |
| Troubleshoot an issue | [docs/reference/QUICK_ANSWERS.md](docs/reference/QUICK_ANSWERS.md) |

### **"I am a..."**

| Role | Start Here |
|------|------------|
| **New Developer** | [docs/setup/GETTING_STARTED.md](docs/setup/GETTING_STARTED.md) |
| **DevOps Engineer** | [docs/setup/CLOUD_RUN_DEPLOYMENT.md](docs/setup/CLOUD_RUN_DEPLOYMENT.md) |
| **n8n Workflow Designer** | [docs/guides/N8N_WORKFLOW_GUIDE.md](docs/guides/N8N_WORKFLOW_GUIDE.md) |
| **DBA/Data Engineer** | [docs/migrations/COMPLETED_DATABASE_UPDATES.md](docs/migrations/COMPLETED_DATABASE_UPDATES.md) |
| **Architect** | [docs/architecture/ASYNC_WEBHOOK_PATTERN.md](docs/architecture/ASYNC_WEBHOOK_PATTERN.md) |

---

## 📊 Document Statistics

| Category | Files | Total Pages (approx) |
|----------|-------|----------------------|
| Setup | 6 | ~30 pages |
| Architecture | 3 | ~15 pages |
| Guides | 3 | ~40 pages |
| Migrations | 4 | ~20 pages |
| Reference | 3 | ~10 pages |
| **Total** | **19** | **~115 pages** |

---

## 🔍 Document Relationships

```
Start Here
    ↓
docs/README.md (Documentation Index)
    ↓
    ├─→ New User? → docs/setup/GETTING_STARTED.md
    │                    ↓
    │               docs/setup/QUICK_START.md
    │                    ↓
    │               docs/setup/SETUP_GUIDE.md
    │
    ├─→ Understanding System? → docs/architecture/ASYNC_WEBHOOK_PATTERN.md
    │                                ↓
    │                           docs/architecture/BOT_SPECIFIC_METRICS.md
    │
    ├─→ Building Workflows? → docs/guides/N8N_WORKFLOW_GUIDE.md
    │                              ↓
    │                         docs/guides/PROJECT_TRACKING_GUIDE.md
    │
    ├─→ Running Migrations? → docs/migrations/COMPLETED_DATABASE_UPDATES.md
    │                              ↓
    │                         sql/006_project_tracking.sql
    │
    └─→ Need Quick Info? → docs/reference/QUICK_REFERENCE.md
                                ↓
                           docs/reference/QUICK_ANSWERS.md
```

---

## 🎨 Document Standards

### **File Naming**
- ALL_CAPS_WITH_UNDERSCORES.md
- Clear, descriptive names
- Grouped by category in folders

### **Content Structure**
- Clear title and description
- Table of contents for long docs
- Code examples with syntax highlighting
- Step-by-step instructions
- Related links at the end

### **Cross-References**
- Use relative links: `[link](../setup/SETUP_GUIDE.md)`
- Always provide context: "See [Setup Guide](../setup/SETUP_GUIDE.md) for details"
- Link to specific sections when possible: `[link](../setup/SETUP_GUIDE.md#database-setup)`

---

## 🔄 Updating Documentation

### **Adding New Documentation**

1. Choose the appropriate folder:
   - `setup/` - Setup and deployment guides
   - `architecture/` - System design docs
   - `guides/` - How-to guides
   - `migrations/` - Migration guides
   - `reference/` - Quick reference materials

2. Create the file with a descriptive name

3. Update these files:
   - `docs/README.md` - Add to the appropriate section
   - This file (`DOCUMENTATION_STRUCTURE.md`) - Update the structure diagram
   - Main `README.md` - If it's a major addition

### **Updating Existing Documentation**

1. Update the content
2. Update the "Last Updated" date at the bottom
3. If structure changes, update `docs/README.md`

### **Deprecating Documentation**

1. Move to `docs/archive/` folder (create if needed)
2. Add "DEPRECATED" note at the top
3. Link to the replacement document
4. Remove from `docs/README.md` index

---

## 📍 Key Entry Points

| Purpose | Document |
|---------|----------|
| **Main entry** | `README.md` (project root) |
| **Documentation index** | `docs/README.md` |
| **Quickstart** | `docs/setup/QUICK_START.md` |
| **Architecture overview** | `docs/architecture/ASYNC_WEBHOOK_PATTERN.md` |
| **Latest changes** | `docs/migrations/COMPLETED_DATABASE_UPDATES.md` |
| **API reference** | `docs/reference/QUICK_REFERENCE.md` |

---

## ✅ Organization Benefits

1. **Clear Structure** - Easy to find documents
2. **Logical Grouping** - Related docs together
3. **Scalable** - Easy to add new documents
4. **Discoverable** - Index and cross-references
5. **Maintainable** - Clear ownership per category

---

**Last Updated:** November 1, 2025  
**Maintained by:** Development Team

