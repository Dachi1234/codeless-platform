# Agent-Specific Tables Migration Guide

## 🎯 Overview

This migration moves from a single `student_profiles` table with bot-specific columns to **dedicated tables for each agent** (Laura, Giorgi, etc.).

### What's Changing:

**BEFORE (❌ Bad for scalability):**
```sql
student_profiles (
  discord_user_id,
  name,
  cohort,
  laura_tension_level,
  laura_trust_level,
  giorgi_tension_level,
  giorgi_trust_level,
  giorgi_tech_respect,
  giorgi_code_quality,
  -- ... 50+ columns for 10 agents! 😱
)
```

**AFTER (✅ Clean & scalable):**
```sql
student_profiles (
  discord_user_id,
  name,
  cohort,
  timezone,
  -- shared data only
)

laura_profiles (
  discord_user_id,
  tension_level,
  trust_level,
  current_project,
  last_milestone,
  blocked,
  priority
)

giorgi_profiles (
  discord_user_id,
  tension_level,
  trust_level,
  tech_respect,
  code_quality,
  current_stack,
  blocker,
  student_type
)
```

---

## 📋 Steps to Run in Neon

### **Step 1: Connect to Neon Database**

1. Go to https://console.neon.tech
2. Select your project: **codeless-platform**
3. Click **SQL Editor**
4. Select the **discord_bots** schema

---

### **Step 2: Run Migration Script**

Copy and paste the **entire contents** of this file into the SQL Editor:

```
discord-bots/sql/005_agent_dedicated_tables.sql
```

Click **Run** to execute.

---

### **Step 3: Verify Migration**

Run these queries to confirm everything worked:

```sql
-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'discord_bots' 
  AND table_name IN ('laura_profiles', 'giorgi_profiles');

-- Check Laura's profiles migrated
SELECT 
  discord_user_id,
  tension_level,
  trust_level,
  current_project,
  message_count
FROM discord_bots.laura_profiles
LIMIT 5;

-- Check Giorgi's profiles migrated
SELECT 
  discord_user_id,
  tension_level,
  trust_level,
  tech_respect,
  code_quality,
  current_stack
FROM discord_bots.giorgi_profiles
LIMIT 5;

-- Check old columns are gone from student_profiles
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'discord_bots' 
  AND table_name = 'student_profiles'
ORDER BY column_name;
```

**Expected Results:**
- ✅ 2 new tables: `laura_profiles`, `giorgi_profiles`
- ✅ Data migrated from `student_profiles` to agent tables
- ✅ Old bot-specific columns removed from `student_profiles`
- ✅ Message counts populated correctly
- ✅ Indexes created for performance

---

## 🔄 What the Migration Does:

1. **Creates new tables:**
   - `laura_profiles` with PM-specific fields
   - `giorgi_profiles` with dev-specific fields

2. **Migrates existing data:**
   - Copies `laura_tension_level` → `laura_profiles.tension_level`
   - Copies `giorgi_tension_level` → `giorgi_profiles.tension_level`
   - Copies `tech_respect` → `giorgi_profiles.tech_respect`
   - Copies `current_project` → `laura_profiles.current_project`
   - etc.

3. **Calculates metrics:**
   - `message_count` per agent (counts from `messages` table)
   - `last_interaction` timestamp (from latest message)

4. **Cleans up:**
   - Drops old bot-specific columns from `student_profiles`
   - Keeps only shared fields (name, cohort, timezone)

5. **Adds performance indexes:**
   - On `tension_level`, `priority`, `student_type`, etc.

6. **Adds auto-update triggers:**
   - `updated_at` timestamp auto-updates on changes

---

## 🧪 Testing After Migration:

Once you've run the migration and pushed the code, test both bots:

### **Test Laura:**
```
@Laura How are you?
```

**Expected:**
- Laura responds
- Logs show: `✅ Updated Laura profile for [user_id]`
- Query shows updated data in `laura_profiles`

### **Test Giorgi:**
```
@Giorgi I'm stuck with TypeScript errors
```

**Expected:**
- Giorgi responds
- Logs show: `✅ Updated Giorgi profile for [user_id]`
- Query shows updated data in `giorgi_profiles`

---

## 🆘 Troubleshooting:

### **Migration fails with "column does not exist":**
- You may have already run part of the migration
- Safe to re-run (uses `IF NOT EXISTS` and `ON CONFLICT`)

### **No data in new tables:**
- Check if `student_profiles` had data: `SELECT COUNT(*) FROM discord_bots.student_profiles;`
- If 0 rows, that's expected for new setup

### **Old columns still exist:**
- Re-run Step 8 of migration manually:
```sql
ALTER TABLE discord_bots.student_profiles
  DROP COLUMN IF EXISTS laura_tension_level,
  DROP COLUMN IF EXISTS laura_trust_level,
  DROP COLUMN IF EXISTS giorgi_tension_level,
  DROP COLUMN IF EXISTS giorgi_trust_level;
```

---

## 📊 Schema Reference:

### `laura_profiles`
| Column | Type | Description |
|--------|------|-------------|
| discord_user_id | VARCHAR(255) | PK, FK to student_profiles |
| tension_level | INTEGER (1-10) | PM tension tracking |
| trust_level | INTEGER (1-10) | PM trust tracking |
| message_count | INTEGER | Count of messages with Laura |
| current_project | TEXT | Active project name |
| last_milestone | TEXT | Most recent milestone |
| blocked | BOOLEAN | Is student blocked? |
| priority | VARCHAR(50) | Priority level (high/medium/low) |
| last_interaction | TIMESTAMP | Last message time |
| updated_at | TIMESTAMP | Auto-updated timestamp |

### `giorgi_profiles`
| Column | Type | Description |
|--------|------|-------------|
| discord_user_id | VARCHAR(255) | PK, FK to student_profiles |
| tension_level | INTEGER (1-10) | Dev tension tracking |
| trust_level | INTEGER (1-10) | Dev trust tracking |
| message_count | INTEGER | Count of messages with Giorgi |
| tech_respect | INTEGER (1-10) | Developer respect level |
| code_quality | INTEGER (1-10) | Code quality assessment |
| current_stack | TEXT | Tech stack being used |
| blocker | TEXT | Current technical blocker |
| student_type | VARCHAR(50) | junior/mid/senior |
| last_interaction | TIMESTAMP | Last message time |
| updated_at | TIMESTAMP | Auto-updated timestamp |

---

## 🚀 After Migration:

Once migration is complete in Neon:

1. ✅ Migration run in Neon
2. ✅ Code already updated and pushed to Git
3. ⏳ **Next:** Cloud Build will deploy automatically
4. ⏳ **Test:** Message both bots to verify they work

---

## 📝 Notes:

- **Migration is idempotent:** Safe to run multiple times
- **Zero downtime:** Bots may be briefly offline during deployment (~2 min)
- **Data preservation:** All existing data is migrated, nothing lost
- **Adding new agents:** Just create a new table (e.g., `nino_profiles`) and add to `database.service.ts`

---

## ✅ Checklist:

- [ ] Run migration SQL in Neon SQL Editor
- [ ] Verify tables created (`laura_profiles`, `giorgi_profiles`)
- [ ] Verify data migrated (run SELECT queries above)
- [ ] Verify old columns dropped from `student_profiles`
- [ ] Wait for Cloud Build deployment to complete
- [ ] Test Laura bot
- [ ] Test Giorgi bot
- [ ] Verify logs show correct profile updates

---

**Need help?** Check logs in Cloud Run:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=discord-bot-laura" --limit 50 --format json
```

