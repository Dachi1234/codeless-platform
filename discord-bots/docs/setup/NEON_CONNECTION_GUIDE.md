# Finding Neon PostgreSQL Connection Details

## 🎯 For n8n PostgreSQL Node Configuration

When connecting n8n to your Neon database, you need these details:

---

## 📍 Where to Find Connection Details in Neon

### Option 1: Get Everything from Connection String (Easiest)

1. **Go to Neon Console**: https://console.neon.tech
2. **Select your project**
3. **Go to Dashboard** (or Connection Details)
4. **Find "Connection string"** section
5. **Copy the connection string**

Example connection string:
```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech:5432/codeless_db?sslmode=require
```

### Breaking It Down:

```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=require
           ↓           ↓           ↓      ↓       ↓
```

| Field | Value in Example | Description |
|-------|-----------------|-------------|
| **Host** | `ep-cool-name-123456.us-east-2.aws.neon.tech` | The server address |
| **Port** | `5432` | PostgreSQL default port |
| **Database** | `codeless_db` | Your database name |
| **User** | `username` | Your Neon username |
| **Password** | `password` | Your database password |
| **SSL** | `require` | Always use SSL with Neon |

---

## 🔌 For n8n PostgreSQL Node

### Step-by-Step in n8n:

1. **Add PostgreSQL node** to your workflow
2. **Click "Create New Credentials"**
3. **Fill in the form:**

#### Connection Details

| n8n Field | Where to Find | Example |
|-----------|--------------|---------|
| **Host** | From connection string (between `@` and `:5432`) | `ep-cool-name-123456.us-east-2.aws.neon.tech` |
| **Database** | From connection string (after `:5432/` and before `?`) | `codeless_db` |
| **User** | From connection string (before first `:` after `//`) | `username` |
| **Password** | From connection string (between first `:` and `@`) | `password` |
| **Port** | Always `5432` for PostgreSQL | `5432` |

#### SSL Configuration

In n8n PostgreSQL node:
- **SSL**: Enable (toggle ON)
- **SSL Mode**: `require` or `verify-full`
- **SSL Certificate**: Leave empty (Neon handles this)

---

## 📸 Visual Guide

### In Neon Console:

```
Dashboard → Connection Details
┌─────────────────────────────────────────────────────┐
│ Connection string                                    │
│                                                      │
│ postgresql://user:pass@ep-xxx.neon.tech:5432/db    │
│                       ↑                             │
│                    THIS IS YOUR HOST                │
└─────────────────────────────────────────────────────┘
```

### Filled n8n Form:

```
PostgreSQL Credentials
┌─────────────────────────────────────────────┐
│ Host: ep-cool-name-123456.us-east-2.aws.neon.tech   │
│ Database: codeless_db                         │
│ User: your_username                           │
│ Password: ••••••••••••••                      │
│ Port: 5432                                    │
│ ☑ SSL (enabled)                               │
└─────────────────────────────────────────────┘
```

---

## 🔍 Step-by-Step: Extract Host from Neon

### Method 1: Neon Console (Visual)

1. Go to https://console.neon.tech
2. Click your project
3. Go to **"Dashboard"** or **"Connection Details"**
4. Look for **"Host"** field directly (some Neon UI versions show it separately)
5. Copy the host value (looks like: `ep-something-123456.region.aws.neon.tech`)

### Method 2: From Connection String

If you see a connection string like:
```
postgresql://neondb_owner:AbCdEf123456@ep-cool-name-123456.us-east-2.aws.neon.tech:5432/codeless_db?sslmode=require
```

The **host** is everything between `@` and the next `:`:
```
ep-cool-name-123456.us-east-2.aws.neon.tech
```

### Method 3: Connection Parameters Tab

In Neon Console:
1. Go to your project
2. Click **"Connection Details"**
3. Switch to **"Connection Parameters"** tab
4. You'll see each field separately:
   - Host: `ep-xxx.region.aws.neon.tech`
   - Port: `5432`
   - Database: `codeless_db`
   - User: `your_user`
   - Password: (click to reveal)

---

## 🧪 Test Connection

### In n8n:

After entering credentials:
1. Click **"Test Credentials"** or **"Test Connection"**
2. You should see: ✅ "Connection successful"
3. If it fails, check:
   - Host is correct (no `postgresql://` prefix!)
   - SSL is enabled
   - Password is correct (no spaces)
   - Port is `5432`

### Test Query in n8n:

Try this simple query to verify:
```sql
SELECT NOW() AS current_time;
```

If it returns a timestamp, connection works! ✅

---

## 🎯 For Discord Bot `.env` File

In your `.env` file, use the **full connection string**:

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech:5432/codeless_db?sslmode=require
```

**NOT** the individual fields!

---

## 📊 Neon Connection Info Summary

### What You Need for n8n:

```yaml
Host: ep-cool-name-123456.us-east-2.aws.neon.tech
Port: 5432
Database: codeless_db
User: your_username
Password: your_password
SSL: Enable ✅
SSL Mode: require
```

### What You Need for Discord Bot (`.env`):

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech:5432/codeless_db?sslmode=require
```

---

## 🔐 Security Notes

### Never Share:
- ❌ Your password
- ❌ Full connection string (contains password!)
- ❌ Database credentials in public repos

### Safe to Share:
- ✅ Host (e.g., `ep-xxx.neon.tech`)
- ✅ Database name (e.g., `codeless_db`)
- ✅ Port (always `5432` for PostgreSQL)
- ✅ Username (less sensitive)

---

## 🚨 Common Mistakes

### ❌ Wrong: Including `postgresql://` in host
```
Host: postgresql://ep-xxx.neon.tech    ← NO!
```

### ✅ Correct: Just the hostname
```
Host: ep-xxx.neon.tech                  ← YES!
```

---

### ❌ Wrong: Forgetting to enable SSL
```
SSL: ☐ (disabled)    ← NO! Neon requires SSL
```

### ✅ Correct: SSL enabled
```
SSL: ☑ (enabled)     ← YES!
```

---

### ❌ Wrong: Using `localhost` or `127.0.0.1`
```
Host: localhost      ← NO! Neon is in the cloud
```

### ✅ Correct: Use Neon's host
```
Host: ep-xxx.region.aws.neon.tech    ← YES!
```

---

## 📚 Quick Reference

### Neon Console Links:
- **Main Console**: https://console.neon.tech
- **Projects**: Click project name → Dashboard
- **Connection Details**: Dashboard → "Connection string" section

### What to Copy for n8n:
1. **Host**: Everything between `@` and `:5432` in connection string
2. **Database**: Everything between `/` and `?` at the end
3. **User**: First part after `postgresql://` (before first `:`)
4. **Password**: Between first `:` and `@`
5. **Port**: Always `5432`
6. **SSL**: Always enabled

---

## ✅ Checklist

- [ ] Open Neon Console
- [ ] Find connection string or connection parameters
- [ ] Extract host (looks like `ep-xxx.region.aws.neon.tech`)
- [ ] Extract database name (usually `codeless_db`)
- [ ] Extract username
- [ ] Copy password (or reveal it in Neon)
- [ ] Enter in n8n with SSL enabled
- [ ] Test connection in n8n
- [ ] Run test query (`SELECT NOW()`)

---

Need help? The host always looks like: `ep-something-123456.region.aws.neon.tech` 🚀

