# Discord Bots - Database Setup

## 🎯 Quick Setup

### 1. Connect to Your Neon Database

Go to **[Neon Console](https://console.neon.tech)** → Your Project → **SQL Editor**

OR use `psql`:

```bash
psql "postgresql://user:password@ep-xxx.neon.tech:5432/codeless_db?sslmode=require"
```

### 2. Run the Schema Script

**Option A: Neon Console (Easiest)**
1. Open SQL Editor in Neon Console
2. Copy contents of `001_discord_schema.sql`
3. Paste and click "Run"

**Option B: psql**
```bash
psql "your-neon-connection-string" -f 001_discord_schema.sql
```

### 3. Verify Installation

Run this query:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'discord_bots';
```

You should see:
- `conversations`
- `messages`
- `student_profiles`

✅ Done! Your database is ready.

---

## 📊 Schema Overview

```
discord_bots schema
├── conversations  (Discord channels/DMs)
├── messages       (All messages: students + agents)
└── student_profiles (Discord users)
```

**Isolated from your main platform** → `public` schema remains unchanged.

