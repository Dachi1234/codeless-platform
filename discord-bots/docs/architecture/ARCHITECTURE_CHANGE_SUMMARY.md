# Architecture Change: Agent-Specific Profile Tables

**Date:** October 30, 2025  
**Change Type:** Database Schema Refactor + Code Update  
**Status:** ✅ Ready to Deploy

---

## 🎯 Problem Solved

**Before:** Single `student_profiles` table with columns for every agent:
- `laura_tension_level`, `laura_trust_level`, `laura_project`...
- `giorgi_tension_level`, `giorgi_trust_level`, `giorgi_tech_respect`...
- Would grow to 50+ columns with 10 agents ❌

**After:** Dedicated table per agent:
- `laura_profiles` - PM-specific metrics
- `giorgi_profiles` - Dev-specific metrics
- Easy to add `nino_profiles`, `luka_profiles`, etc. ✅

---

## 📦 Files Changed

### 1. **Database Migration**
- `sql/005_agent_dedicated_tables.sql` ⭐ **RUN THIS IN NEON**
  - Creates `laura_profiles` and `giorgi_profiles` tables
  - Migrates existing data from `student_profiles`
  - Drops old bot-specific columns
  - Adds indexes and triggers

### 2. **Database Service** 
- `src/services/database.service.ts`
  - Added `LauraProfile` and `GiorgiProfile` interfaces
  - Added `getOrCreateLauraProfile()` method
  - Added `getOrCreateGiorgiProfile()` method
  - Added `updateLauraProfile()` method
  - Added `updateGiorgiProfile()` method
  - Updated `updateStudentProfile()` to route to correct table

### 3. **Bot Logic**
- `src/bot.ts`
  - Fetches agent-specific profile before sending to n8n
  - Passes profile data to n8n webhook
  - Routes profile updates to correct agent table

### 4. **N8n Service**
- `src/services/n8n.service.ts`
  - Updated `N8nRequest` interface to include `studentProfile`
  - Updated `sendToAgent()` to accept and pass profile data

### 5. **Documentation**
- `AGENT_TABLES_MIGRATION_GUIDE.md` - Step-by-step guide
- `ARCHITECTURE_CHANGE_SUMMARY.md` - This file

---

## 🗄️ New Schema

### `laura_profiles`
```sql
CREATE TABLE laura_profiles (
  discord_user_id VARCHAR(255) PRIMARY KEY,
  tension_level INTEGER DEFAULT 5,
  trust_level INTEGER DEFAULT 5,
  message_count INTEGER DEFAULT 0,
  current_project TEXT,
  last_milestone TEXT,
  blocked BOOLEAN DEFAULT false,
  priority VARCHAR(50),
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `giorgi_profiles`
```sql
CREATE TABLE giorgi_profiles (
  discord_user_id VARCHAR(255) PRIMARY KEY,
  tension_level INTEGER DEFAULT 5,
  trust_level INTEGER DEFAULT 5,
  message_count INTEGER DEFAULT 0,
  tech_respect INTEGER DEFAULT 5,
  code_quality INTEGER DEFAULT 5,
  current_stack TEXT,
  blocker TEXT,
  student_type VARCHAR(50),
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Data Flow (Updated)

```
1. Student messages @Laura in Discord
   ↓
2. Bot creates/updates student_profiles (shared data)
   ↓
3. Bot fetches laura_profiles for this student
   ↓
4. Bot sends to Laura's n8n webhook:
   {
     userId: "123",
     message: "...",
     conversationContext: [...],
     studentProfile: {              ← NEW!
       tension_level: 7,
       trust_level: 6,
       current_project: "Checkout",
       message_count: 42
     }
   }
   ↓
5. Laura's n8n workflow responds with:
   {
     response: "...",
     profile_updates: {
       tension_level: 8,
       current_project: "Payment Gateway"
     }
   }
   ↓
6. Bot updates laura_profiles table
```

---

## 📊 Benefits

1. **Scalability** - Add new agents without schema changes
2. **Performance** - No NULL columns, focused indexes
3. **Clarity** - Clear separation of concerns
4. **Maintainability** - Easy to understand and extend
5. **Type Safety** - Each agent has its own interface

---

## 🚀 Deployment Steps

### **Step 1: Run Migration in Neon**
1. Go to Neon Console → SQL Editor
2. Copy contents of `sql/005_agent_dedicated_tables.sql`
3. Paste and run
4. Verify with queries in migration guide

### **Step 2: Code Already Updated**
✅ All code changes are in this commit

### **Step 3: Push to Git**
```bash
git add .
git commit -m "refactor: Move to agent-specific profile tables"
git push
```

### **Step 4: Cloud Build Auto-Deploys**
- Wait ~2-3 minutes for deployment
- Both bots will restart with new code

### **Step 5: Test**
```
@Laura How are you?
@Giorgi I need help with TypeScript
```

---

## 🧪 Testing Checklist

After deployment:

- [ ] Laura responds correctly
- [ ] Giorgi responds correctly
- [ ] Logs show `✅ Updated Laura profile for [user]`
- [ ] Logs show `✅ Updated Giorgi profile for [user]`
- [ ] Query `laura_profiles` shows updated data
- [ ] Query `giorgi_profiles` shows updated data
- [ ] No errors in Cloud Run logs

---

## 📝 Example n8n Workflow Update

In your **n8n "Check Profile" node** (Postgres node), update the query:

### **For Laura's workflow:**
```sql
SELECT 
  discord_user_id,
  tension_level,
  trust_level,
  message_count,
  current_project,
  last_milestone,
  blocked,
  priority,
  last_interaction
FROM discord_bots.laura_profiles
WHERE discord_user_id = '{{ $json.userId }}';
```

### **For Giorgi's workflow:**
```sql
SELECT 
  discord_user_id,
  tension_level,
  trust_level,
  message_count,
  tech_respect,
  code_quality,
  current_stack,
  blocker,
  student_type,
  last_interaction
FROM discord_bots.giorgi_profiles
WHERE discord_user_id = '{{ $json.userId }}';
```

**OR:** You can now use the `studentProfile` field passed directly from the bot! 🎉

```javascript
// In n8n Code node
const profile = $json.studentProfile;
console.log('Tension:', profile.tension_level);
console.log('Project:', profile.current_project);
```

---

## 🔮 Future: Adding New Agents

To add a new agent (e.g., Nino):

1. **Create table:**
```sql
CREATE TABLE nino_profiles (
  discord_user_id VARCHAR(255) PRIMARY KEY,
  tension_level INTEGER DEFAULT 5,
  trust_level INTEGER DEFAULT 5,
  message_count INTEGER DEFAULT 0,
  test_coverage INTEGER,
  bugs_found INTEGER,
  qa_focus VARCHAR(100),
  last_interaction TIMESTAMP DEFAULT NOW()
);
```

2. **Add interface:**
```typescript
export interface NinoProfile {
  discordUserId: string;
  tensionLevel: number;
  trustLevel: number;
  messageCount: number;
  testCoverage: number;
  bugsFound: number;
  qaFocus: string | null;
}
```

3. **Add methods:**
```typescript
async getOrCreateNinoProfile(discordUserId: string): Promise<NinoProfile>
async updateNinoProfile(discordUserId: string, updates: any)
```

4. **Update router:**
```typescript
if (botName === 'nino') {
  await this.getOrCreateNinoProfile(discordUserId);
  await this.updateNinoProfile(discordUserId, updates);
}
```

Done! 🎉

---

## 📚 Related Documentation

- `AGENT_TABLES_MIGRATION_GUIDE.md` - Neon migration steps
- `MULTI_BOT_MIGRATION.md` - Multi-bot architecture
- `BOT_SPECIFIC_METRICS.md` - Previous (now obsolete) approach

---

## ✅ Migration Complete!

Once you:
1. ✅ Run SQL in Neon
2. ✅ Push code to Git
3. ✅ Wait for deployment
4. ✅ Test both bots

You're done! 🚀

