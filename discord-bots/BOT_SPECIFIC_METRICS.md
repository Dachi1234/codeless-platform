# Bot-Specific Tension & Trust Tracking

## 🎯 Problem Solved

Both Laura and Giorgi need to track `tension_level` and `trust_level`, but from **different perspectives**:

- **Laura's Perspective** (PM/Project Manager):
  - `tension_level`: Project stress, deadlines, scope creep
  - `trust_level`: Trust in student's execution and commitment

- **Giorgi's Perspective** (Technical Mentor):
  - `tension_level`: Technical stress, bugs, technical debt, blockers
  - `trust_level`: Trust in student's technical decisions and code quality

## 📊 Database Schema

### Before (Conflicting):
```sql
student_profiles
├── tension_level      ← Laura and Giorgi both update this! ❌
└── trust_level        ← Conflict! ❌
```

### After (Clean & Separate):
```sql
student_profiles
├── laura_tension_level   ← Laura's PM tension
├── laura_trust_level     ← Laura's trust
├── giorgi_tension_level  ← Giorgi's technical tension
├── giorgi_trust_level    ← Giorgi's trust
├── tech_respect          ← Giorgi only
├── code_quality          ← Giorgi only
└── current_project       ← Laura only
```

**Note: Generic `tension_level` and `trust_level` columns have been removed. Each bot has its own!**

## ✅ What Was Changed

### 1. Database (SQL Migration)
**File:** `sql/004_bot_specific_tension_trust.sql`

- Added `laura_tension_level` and `laura_trust_level`
- Added `giorgi_tension_level` and `giorgi_trust_level`
- Migrated existing data to Laura's columns
- Added check constraints (0-10 range)
- Kept old columns for backward compatibility

### 2. Database Service (TypeScript)
**File:** `src/services/database.service.ts`

- Updated `updateStudentProfile()` to accept `botName` parameter
- Maps generic `tension_level` → `{botName}_tension_level`
- Maps generic `trust_level` → `{botName}_trust_level`
- Added support for Giorgi's additional fields

```typescript
// Old:
await this.db.updateStudentProfile(userId, { tension_level: 8 });
// Would update generic "tension_level"

// New:
await this.db.updateStudentProfile(userId, { tension_level: 8 }, 'laura');
// Updates "laura_tension_level"

await this.db.updateStudentProfile(userId, { tension_level: 6 }, 'giorgi');
// Updates "giorgi_tension_level"
```

### 3. Bot Logic (TypeScript)
**File:** `src/bot.ts`

- Passes `this.botName` to `updateStudentProfile()`
- Each bot automatically updates its own columns

## 🚀 How to Deploy

### Step 1: Run SQL Migration

In Neon SQL Editor:
```sql
-- Run the entire file
\i discord-bots/sql/004_bot_specific_tension_trust.sql
```

Or copy/paste the contents of `004_bot_specific_tension_trust.sql`.

### Step 2: Push Code Changes

```bash
cd C:\Users\Ryzen\Desktop\Codeless_Web
git add .
git commit -m "feat: Add bot-specific tension/trust tracking"
git push origin main
```

Cloud Build will automatically deploy.

### Step 3: Update n8n Workflows

**Laura's Workflow:**
- AI Agent already outputs `tension_level` and `trust_level`
- No changes needed! ✅

**Giorgi's Workflow:**
- AI Agent can now output both:
  - `tension_level` (technical tension)
  - `trust_level` (trust in technical decisions)
  - `tech_respect` (additional field)
  - `code_quality` (additional field)
  - etc.

## 📊 Example Data Flow

### Student: Dachi

**Laura's view (after conversation about missed deadline):**
```json
{
  "laura_tension_level": 8,  // High PM stress!
  "laura_trust_level": 3,    // Low trust in execution
  "current_project": "Streamlined Checkout Flow"
}
```

**Giorgi's view (after code review):**
```json
{
  "giorgi_tension_level": 5,    // Moderate technical debt
  "giorgi_trust_level": 7,      // Good technical decisions
  "tech_respect": 8,             // Respects best practices
  "code_quality": 6,             // Code is decent
  "current_stack": "React, Node.js, PostgreSQL",
  "blocker": "Database connection pooling"
}
```

**Both stored in the same student_profiles row!**

## 🔍 Query Examples

### Get full student profile:
```sql
SELECT 
  username,
  -- Laura's metrics
  laura_tension_level,
  laura_trust_level,
  current_project,
  deadline_mvp,
  -- Giorgi's metrics
  giorgi_tension_level,
  giorgi_trust_level,
  tech_respect,
  code_quality,
  current_stack,
  blocker
FROM discord_bots.student_profiles
WHERE discord_user_id = '689866902906208283';
```

### Compare Laura vs Giorgi's assessments:
```sql
SELECT 
  username,
  laura_tension_level AS laura_sees_tension,
  giorgi_tension_level AS giorgi_sees_tension,
  laura_trust_level AS laura_trust,
  giorgi_trust_level AS giorgi_trust
FROM discord_bots.student_profiles
WHERE username = 'dachi_peradze123';
```

## ✅ Benefits

1. **No Conflicts**: Each bot has its own metrics
2. **Rich Context**: One student, multiple expert perspectives
3. **Clean Schema**: No generic columns, only bot-specific ones
4. **Scalable**: Easy to add more bots (nino_tension_level, etc.)
5. **Clear Ownership**: Each metric is clearly owned by a specific bot

## 🎉 Result

- ✅ Laura tracks PM tension (deadlines, scope) in `laura_tension_level`
- ✅ Giorgi tracks technical tension (bugs, debt) in `giorgi_tension_level`
- ✅ Both perspectives stored together
- ✅ No data conflicts
- ✅ Full conversation history per bot
- ✅ Clean, maintainable database schema

