# Quick Reference Card - Project Tracking

## 🎯 Common Operations

### **1. Laura Assigns Project**
```typescript
await db.updateSharedStudentProfile(userId, {
  current_project: 'E-commerce Checkout',
  project_description: 'Build checkout with Stripe',
  project_status: 'in_progress',
  deadline_mvp: '2025-11-15',
});

await db.updateLauraProfile(userId, {
  tension_level: 2,
  notes: 'Just assigned project.',
});
```

### **2. Giorgi First Build**
```typescript
// After v0 creates project
await db.updateGiorgiVercelSession(userId, projectId, chatId);

await db.saveDeployment(userId, deploymentUrl, {
  featureDescription: 'Initial login page',
  userPrompt: userMessage,
  vercelChatId: chatId,
  status: 'success',
  buildTimeSeconds: 42,
});

await db.updateGiorgiProfile(userId, {
  latest_deployment_url: deploymentUrl,
  deployment_status: 'success',
  notes: 'Good first build.',
});
```

### **3. Giorgi Continues Editing**
```typescript
// Get existing chat
const profile = await db.getOrCreateGiorgiProfile(userId);
const chatId = profile.vercelChatId;

// Use chatId in v0 API call...

// Save new deployment
await db.saveDeployment(userId, newUrl, {
  featureDescription: 'Made button blue',
  userPrompt: userMessage,
  vercelChatId: chatId,
  status: 'success',
});

await db.updateGiorgiProfile(userId, {
  latest_deployment_url: newUrl,
});
```

### **4. Get Deployment History**
```typescript
const history = await db.getDeploymentHistory(userId, 5);
const latest = await db.getLatestDeployment(userId);
const stats = await db.getDeploymentStats(userId);

console.log(`Total: ${stats.totalDeployments}`);
console.log(`Latest: ${latest?.deploymentUrl}`);
```

---

## 📋 n8n PostgreSQL Snippets

### **Get Giorgi Profile with Vercel Data**
```sql
SELECT 
  gp.vercel_chat_id, 
  gp.latest_deployment_url,
  sp.current_project
FROM discord_bots.student_profiles sp
LEFT JOIN discord_bots.giorgi_profiles gp 
  ON gp.discord_user_id = sp.discord_user_id
WHERE sp.discord_user_id = '{{ $json.userId }}';
```

### **Save Deployment**
```sql
INSERT INTO discord_bots.deployments 
  (discord_user_id, feature_description, user_prompt, deployment_url, vercel_chat_id, status, build_time_seconds)
VALUES 
  ('{{ $json.userId }}', 
   '{{ $json.feature }}', 
   '{{ $json.prompt }}',
   '{{ $json.url }}',
   '{{ $json.chatId }}',
   'success',
   {{ $json.buildTime }});
```

### **Update Giorgi After Deploy**
```sql
UPDATE discord_bots.giorgi_profiles
SET 
  vercel_chat_id = '{{ $json.chatId }}',
  latest_deployment_url = '{{ $json.url }}',
  deployment_status = 'success'
WHERE discord_user_id = '{{ $json.userId }}';
```

### **Get Last 5 Deployments**
```sql
SELECT 
  feature_description,
  deployment_url,
  status,
  created_at
FROM discord_bots.deployments
WHERE discord_user_id = '{{ $json.userId }}'
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🔧 n8n Response Format

### **Laura Response (Assign Project)**
```json
{
  "response": "Alright, here's your project: E-commerce Checkout...",
  "profile_updates": {
    "current_project": "E-commerce Checkout System",
    "project_description": "Build checkout with Stripe",
    "project_status": "in_progress",
    "deadline_mvp": "2025-11-15",
    "tension_level": 2,
    "notes": "Just assigned project. Clear brief given."
  }
}
```

### **Giorgi Response (After Build)**
```json
{
  "response": "Done! Here's your login page: https://...",
  "profile_updates": {
    "tech_respect": 8,
    "notes": "Excellent BRD. Clear requirements. Fast iteration."
  }
}
```

**Note:** Deployment saving happens in separate PostgreSQL node, not in `profile_updates`.

---

## 🗂️ Field Mapping

### **Shared (student_profiles)**
- `current_project` - Project name
- `project_description` - What it does
- `project_status` - `not_started`, `in_progress`, `completed`, `on_hold`
- `admin_notes` - Visible to all agents
- `deadline_mvp` - MVP deadline

### **Laura-Specific (laura_profiles)**
- `notes` - Laura's private notes
- `tension_level` - 1-10
- `trust_level` - 1-10
- `last_milestone` - Last achievement

### **Giorgi-Specific (giorgi_profiles)**
- `notes` - Giorgi's private notes
- `vercel_project_id` - Vercel project (persists)
- `vercel_chat_id` - v0 chat ID (continue conversations)
- `latest_deployment_url` - Current live URL
- `deployment_status` - `success`, `failed`, `building`
- `tech_respect` - 1-10
- `code_quality` - 1-10

### **Deployments (deployments table)**
- `feature_description` - "Added login page"
- `user_prompt` - Original student request
- `deployment_url` - Live URL
- `vercel_chat_id` - Which chat created this
- `status` - `success` or `failed`
- `error_message` - If failed
- `build_time_seconds` - Build duration

---

## ⚡ Quick Checks

### **Does Student Have Project?**
```typescript
const profile = await db.getOrCreateStudentProfile(userId, username);
if (!profile.currentProject || profile.projectStatus === 'not_started') {
  return "No project yet.";
}
```

### **Is This First Build?**
```typescript
const giorgiProfile = await db.getOrCreateGiorgiProfile(userId);
if (!giorgiProfile.vercelChatId) {
  // First build - create new project
} else {
  // Continue existing chat
}
```

### **Get Latest URL**
```typescript
const giorgiProfile = await db.getOrCreateGiorgiProfile(userId);
return giorgiProfile.latestDeploymentUrl || "No deployments yet";
```

---

## 📊 Statistics

```typescript
const stats = await db.getDeploymentStats(userId);

console.log(`Total deployments: ${stats.totalDeployments}`);
console.log(`Successful: ${stats.successfulDeployments}`);
console.log(`Failed: ${stats.failedDeployments}`);
console.log(`Avg build time: ${stats.averageBuildTime}s`);
```

---

## 🚨 Common Mistakes

❌ **Wrong:** Using `notes` in shared profile
```typescript
await db.updateSharedStudentProfile(userId, {
  notes: 'Private observation', // ❌ Wrong field!
});
```

✅ **Right:** Use `admin_notes` or agent-specific `notes`
```typescript
await db.updateSharedStudentProfile(userId, {
  admin_notes: 'Visible to all agents',
});

await db.updateLauraProfile(userId, {
  notes: 'Laura\'s private observation',
});
```

---

❌ **Wrong:** Creating new chat every time
```typescript
// ❌ This creates a new project every time!
const v0Response = await createV0Project(prompt);
```

✅ **Right:** Check for existing chat first
```typescript
const profile = await db.getOrCreateGiorgiProfile(userId);
const chatId = profile.vercelChatId;

if (chatId) {
  // Continue existing chat
  await continueV0Chat(chatId, prompt);
} else {
  // First time - create new
  await createV0Project(prompt);
}
```

---

## 📁 Files

- **Full Guide:** `PROJECT_TRACKING_GUIDE.md`
- **Migration:** `sql/006_project_tracking.sql`
- **Summary:** `DATABASE_UPDATE_SUMMARY.md`
- **This File:** `QUICK_REFERENCE.md`

---

**Last Updated:** 2025-11-01

