# Discord Bots Documentation

Complete documentation for the multi-agent Discord bot system.

---

## 📚 Quick Navigation

| Section | Description | Files |
|---------|-------------|-------|
| **[Setup](./setup/)** | Installation and deployment guides | 6 files |
| **[Architecture](./architecture/)** | System design and patterns | 3 files |
| **[Guides](./guides/)** | User guides and workflows | 3 files |
| **[Migrations](./migrations/)** | Database migrations and changes | 4 files |
| **[Reference](./reference/)** | Quick reference materials | 3 files |

---

## 🚀 Getting Started

### **New to the project?**
1. Start with **[setup/GETTING_STARTED.md](./setup/GETTING_STARTED.md)**
2. Follow **[setup/QUICK_START.md](./setup/QUICK_START.md)**
3. Read **[architecture/ASYNC_WEBHOOK_PATTERN.md](./architecture/ASYNC_WEBHOOK_PATTERN.md)**

### **Setting up locally?**
1. **[setup/SETUP_GUIDE.md](./setup/SETUP_GUIDE.md)** - Local development setup
2. **[setup/NEON_CONNECTION_GUIDE.md](./setup/NEON_CONNECTION_GUIDE.md)** - Database connection

### **Deploying to production?**
1. **[setup/CLOUD_RUN_DEPLOYMENT.md](./setup/CLOUD_RUN_DEPLOYMENT.md)** - Google Cloud Run deployment
2. **[setup/GIT_DEPLOYMENT_CHECKLIST.md](./setup/GIT_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

---

## 📖 Documentation Sections

### **1. Setup & Deployment** (`setup/`)

Complete guides for setting up and deploying the bot system.

- **[GETTING_STARTED.md](./setup/GETTING_STARTED.md)** - Introduction and overview
- **[QUICK_START.md](./setup/QUICK_START.md)** - Quickstart guide (5 minutes)
- **[SETUP_GUIDE.md](./setup/SETUP_GUIDE.md)** - Full local setup guide
- **[CLOUD_RUN_DEPLOYMENT.md](./setup/CLOUD_RUN_DEPLOYMENT.md)** - Cloud Run deployment
- **[NEON_CONNECTION_GUIDE.md](./setup/NEON_CONNECTION_GUIDE.md)** - Database setup
- **[GIT_DEPLOYMENT_CHECKLIST.md](./setup/GIT_DEPLOYMENT_CHECKLIST.md)** - Deployment checklist

### **2. Architecture & Design** (`architecture/`)

System architecture, patterns, and design decisions.

- **[ASYNC_WEBHOOK_PATTERN.md](./architecture/ASYNC_WEBHOOK_PATTERN.md)** - Sync/async webhook pattern
- **[ARCHITECTURE_CHANGE_SUMMARY.md](./architecture/ARCHITECTURE_CHANGE_SUMMARY.md)** - Architecture evolution
- **[BOT_SPECIFIC_METRICS.md](./architecture/BOT_SPECIFIC_METRICS.md)** - Agent-specific metrics design

### **3. User Guides** (`guides/`)

Guides for using and integrating with the bot system.

- **[PROJECT_TRACKING_GUIDE.md](./guides/PROJECT_TRACKING_GUIDE.md)** - Project tracking system
- **[N8N_WORKFLOW_GUIDE.md](./guides/N8N_WORKFLOW_GUIDE.md)** - n8n workflow integration
- **[DATABASE_UPDATE_SUMMARY.md](./guides/DATABASE_UPDATE_SUMMARY.md)** - Database schema guide

### **4. Migration Guides** (`migrations/`)

Database migration guides and change summaries.

- **[COMPLETED_DATABASE_UPDATES.md](./migrations/COMPLETED_DATABASE_UPDATES.md)** - Latest updates
- **[AGENT_TABLES_MIGRATION_GUIDE.md](./migrations/AGENT_TABLES_MIGRATION_GUIDE.md)** - Agent tables migration
- **[MULTI_BOT_MIGRATION.md](./migrations/MULTI_BOT_MIGRATION.md)** - Multi-bot migration
- **[CHANGES_SUMMARY.md](./migrations/CHANGES_SUMMARY.md)** - All changes summary

### **5. Quick Reference** (`reference/`)

Quick lookup materials for common tasks.

- **[QUICK_REFERENCE.md](./reference/QUICK_REFERENCE.md)** - Quick reference card
- **[QUICK_ANSWERS.md](./reference/QUICK_ANSWERS.md)** - Common Q&A
- **[QUICK_CHECKLIST.md](./reference/QUICK_CHECKLIST.md)** - Quick checklist

---

## 🗂️ Related Documentation

### **SQL Migrations** (`../sql/`)
All database migration scripts:
- `001_discord_schema.sql` - Initial schema
- `002_add_student_profile_columns.sql` - Student profiles
- `003_multi_bot_support.sql` - Multi-bot support
- `004_bot_specific_tension_trust.sql` - Bot-specific metrics
- `005_agent_dedicated_tables.sql` - Dedicated agent tables
- `006_project_tracking.sql` - Project tracking & deployments

### **Source Code** (`../src/`)
- `bot.ts` - Main bot logic
- `index.ts` - Application entry point
- `config.ts` - Configuration management
- `services/database.service.ts` - Database operations
- `services/n8n.service.ts` - n8n integration

---

## 🎯 Common Tasks

### **I want to...**

| Task | Documentation |
|------|---------------|
| Set up the bot locally | [setup/SETUP_GUIDE.md](./setup/SETUP_GUIDE.md) |
| Deploy to Cloud Run | [setup/CLOUD_RUN_DEPLOYMENT.md](./setup/CLOUD_RUN_DEPLOYMENT.md) |
| Understand the architecture | [architecture/ASYNC_WEBHOOK_PATTERN.md](./architecture/ASYNC_WEBHOOK_PATTERN.md) |
| Add a new agent | [architecture/BOT_SPECIFIC_METRICS.md](./architecture/BOT_SPECIFIC_METRICS.md) |
| Create n8n workflow | [guides/N8N_WORKFLOW_GUIDE.md](./guides/N8N_WORKFLOW_GUIDE.md) |
| Track student projects | [guides/PROJECT_TRACKING_GUIDE.md](./guides/PROJECT_TRACKING_GUIDE.md) |
| Run database migration | [migrations/COMPLETED_DATABASE_UPDATES.md](./migrations/COMPLETED_DATABASE_UPDATES.md) |
| Quick API reference | [reference/QUICK_REFERENCE.md](./reference/QUICK_REFERENCE.md) |

---

## 📊 System Overview

### **Bots**
- **Laura** - Business stakeholder bot (manages projects, deadlines, pressure)
- **Giorgi** - Senior developer bot (builds features with v0/Vercel)
- *(More agents coming soon: Nino, Luka, Maia)*

### **Architecture**
- **Discord Bot** (TypeScript) - Handles Discord messages
- **n8n Workflows** - AI agent logic and integrations
- **PostgreSQL (Neon)** - Stores conversations, profiles, deployments
- **Google Cloud Run** - Serverless hosting
- **Vercel/v0** - AI-powered code generation

### **Key Features**
- Multi-bot support (Laura, Giorgi, and more)
- Agent-specific memory and metrics
- Project tracking and deployment history
- Async webhook pattern for long-running tasks
- Full conversation history

---

## 🛠️ Development

### **Prerequisites**
- Node.js 18+
- PostgreSQL (or Neon account)
- Google Cloud account (for deployment)
- n8n instance
- Discord bot tokens

### **Local Development**
```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your credentials

# Run locally
npm run dev
```

### **Deployment**
```bash
# Build Docker image
docker build -t discord-bot-laura .

# Deploy to Cloud Run (automated via Git push)
git push origin main
```

See [setup/CLOUD_RUN_DEPLOYMENT.md](./setup/CLOUD_RUN_DEPLOYMENT.md) for details.

---

## 📝 Contributing

When adding new documentation:
1. Place it in the appropriate folder
2. Update this README.md
3. Use clear headings and examples
4. Include code snippets where helpful

---

## 🆘 Need Help?

1. Check **[reference/QUICK_ANSWERS.md](./reference/QUICK_ANSWERS.md)** for common issues
2. Review **[reference/QUICK_CHECKLIST.md](./reference/QUICK_CHECKLIST.md)** for troubleshooting
3. Read the relevant guide in the sections above

---

**Last Updated:** November 1, 2025  
**Version:** 2.0 (Multi-bot with project tracking)

