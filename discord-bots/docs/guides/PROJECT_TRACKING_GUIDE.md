# Project Tracking & Deployment History Guide

Complete guide for using the new project tracking and deployment history features.

---

## 📋 Table of Contents

1. [Database Schema Overview](#database-schema-overview)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Database Service Methods](#database-service-methods)
4. [Usage Examples](#usage-examples)
5. [n8n Integration](#n8n-integration)
6. [Common Patterns](#common-patterns)

---

## Database Schema Overview

### **student_profiles** (Shared Data)

| Field | Type | Description |
|-------|------|-------------|
| `current_project` | TEXT | Project name (e.g., "E-commerce Checkout System") |
| `project_description` | TEXT | What the project does |
| `project_status` | VARCHAR(50) | `not_started`, `in_progress`, `completed`, `on_hold` |
| `admin_notes` | TEXT | Notes visible to all agents (renamed from `notes`) |
| `deadline_mvp` | TIMESTAMP | MVP deadline set by Laura |

### **laura_profiles** (Laura-Specific)

| Field | Type | Description |
|-------|------|-------------|
| `notes` | TEXT | Laura's private observations |
| `tension_level` | INTEGER | 1-10 |
| `trust_level` | INTEGER | 1-10 |
| `last_milestone` | TEXT | Last achieved milestone |

### **giorgi_profiles** (Giorgi-Specific)

| Field | Type | Description |
|-------|------|-------------|
| `notes` | TEXT | Giorgi's private observations |
| `vercel_project_id` | VARCHAR(255) | Vercel project ID (persists) |
| `vercel_chat_id` | VARCHAR(255) | v0 chat ID (to continue conversations) |
| `latest_deployment_url` | TEXT | Current live deployment URL |
| `deployment_status` | VARCHAR(50) | `success`, `failed`, `building`, `not_deployed` |
| `tech_respect` | INTEGER | 1-10 |
| `code_quality` | INTEGER | 1-10 |

### **deployments** (History Table)

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key |
| `discord_user_id` | VARCHAR(255) | Student reference |
| `feature_description` | TEXT | "Added login page", "Fixed button color" |
| `user_prompt` | TEXT | Original student request |
| `deployment_id` | VARCHAR(255) | Vercel deployment ID |
| `deployment_url` | TEXT | Deployment URL |
| `vercel_chat_id` | VARCHAR(255) | Which chat created this |
| `status` | VARCHAR(50) | `success` or `failed` |
| `error_message` | TEXT | Error details if failed |
| `build_time_seconds` | INTEGER | How long the build took |
| `created_at` | TIMESTAMP | When deployed |

---

## TypeScript Interfaces

```typescript
export interface StudentProfile {
  discordUserId: string;
  username: string;
  displayName: string | null;
  name: string | null;
  cohort: string | null;
  timezone: string | null;
  currentProject: string | null;
  projectDescription: string | null;
  projectStatus: string | null;
  adminNotes: string | null;
  deadlineMvp: Date | null;
  firstSeenAt: Date;
  lastSeenAt: Date;
  messageCount: number;
}

export interface LauraProfile {
  discordUserId: string;
  tensionLevel: number;
  trustLevel: number;
  messageCount: number;
  lastMilestone: string | null;
  blocked: boolean;
  priority: string | null;
  notes: string | null;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GiorgiProfile {
  discordUserId: string;
  tensionLevel: number;
  trustLevel: number;
  messageCount: number;
  techRespect: number;
  codeQuality: number;
  currentStack: string | null;
  blocker: string | null;
  studentType: string | null;
  notes: string | null;
  vercelProjectId: string | null;
  vercelChatId: string | null;
  latestDeploymentUrl: string | null;
  deploymentStatus: string | null;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deployment {
  id: number;
  discordUserId: string;
  featureDescription: string | null;
  userPrompt: string | null;
  deploymentId: string | null;
  deploymentUrl: string;
  vercelChatId: string | null;
  status: 'success' | 'failed';
  errorMessage: string | null;
  buildTimeSeconds: number | null;
  createdAt: Date;
}
```

---

## Database Service Methods

### **Shared Profile Updates**

```typescript
// Update shared fields (visible to all agents)
await db.updateSharedStudentProfile(discordUserId, {
  name: 'Dachi',
  cohort: '23',
  timezone: 'America/New_York',
  current_project: 'E-commerce Checkout',
  project_description: 'Modern checkout with Stripe integration',
  project_status: 'in_progress',
  admin_notes: 'Student needs extra support with APIs',
  deadline_mvp: '2025-11-15',
});
```

### **Laura Profile Updates**

```typescript
// Update Laura's private data
await db.updateLauraProfile(discordUserId, {
  tension_level: 7,
  trust_level: 3,
  last_milestone: 'Delivered wireframes on time',
  notes: 'Student missed 2 deadlines. Needs close monitoring.',
  blocked: false,
  priority: 'high',
});
```

### **Giorgi Profile Updates**

```typescript
// Update Giorgi's private data
await db.updateGiorgiProfile(discordUserId, {
  tension_level: 3,
  trust_level: 8,
  tech_respect: 9,
  code_quality: 7,
  current_stack: 'React, TypeScript, Tailwind',
  blocker: null,
  student_type: 'fast_learner',
  notes: 'Excellent at following BRDs. Prefers dark themes.',
  vercel_project_id: 'proj_abc123',
  vercel_chat_id: 'chat_xyz789',
  latest_deployment_url: 'https://v0-project.vercel.app',
  deployment_status: 'success',
});
```

### **Vercel Session Management**

```typescript
// Save Vercel project and chat ID (first deployment)
await db.updateGiorgiVercelSession(
  discordUserId,
  'proj_abc123',
  'chat_xyz789'
);

// Get existing chat ID to continue conversation
const profile = await db.getOrCreateGiorgiProfile(discordUserId);
const chatId = profile.vercelChatId; // Use this to continue chat
```

### **Deployment Tracking**

```typescript
// Save a successful deployment
await db.saveDeployment(discordUserId, 'https://v0-project-v2.vercel.app', {
  featureDescription: 'Added shopping cart feature',
  userPrompt: 'Build me a shopping cart with add/remove items',
  deploymentId: 'dpl_xyz',
  vercelChatId: 'chat_xyz789',
  status: 'success',
  buildTimeSeconds: 45,
});

// Save a failed deployment
await db.saveDeployment(discordUserId, '', {
  featureDescription: 'Attempted to add payment',
  userPrompt: 'Integrate Stripe checkout',
  status: 'failed',
  errorMessage: 'Build failed: Missing Stripe API key',
});

// Get deployment history
const history = await db.getDeploymentHistory(discordUserId, 5); // Last 5 deployments

// Get latest successful deployment
const latest = await db.getLatestDeployment(discordUserId);
console.log(`Latest: ${latest?.deploymentUrl}`);

// Get statistics
const stats = await db.getDeploymentStats(discordUserId);
console.log(`Total: ${stats.totalDeployments}, Success: ${stats.successfulDeployments}`);
```

---

## Usage Examples

### **Example 1: Laura Assigns Project**

```typescript
// Laura assigns project to student
await db.updateSharedStudentProfile(discordUserId, {
  current_project: 'E-commerce Checkout System',
  project_description: 'Build a modern checkout flow with Stripe, mobile-first',
  project_status: 'in_progress',
  deadline_mvp: '2025-11-15',
});

await db.updateLauraProfile(discordUserId, {
  tension_level: 2,
  trust_level: 0,
  notes: 'Just assigned project. Waiting to see initial progress.',
});
```

### **Example 2: Giorgi First Deployment**

```typescript
// Student: "Build me a login page"
const userPrompt = 'Build me a login page';

// 1. Create Vercel project and chat (first time)
const vercelProjectId = 'proj_abc123'; // from v0 API
const vercelChatId = 'chat_xyz789'; // from v0 API

await db.updateGiorgiVercelSession(discordUserId, vercelProjectId, vercelChatId);

// 2. Save deployment
await db.saveDeployment(discordUserId, 'https://v0-login.vercel.app', {
  featureDescription: 'Initial login page',
  userPrompt: userPrompt,
  deploymentId: 'dpl_123',
  vercelChatId: vercelChatId,
  status: 'success',
  buildTimeSeconds: 42,
});

// 3. Update Giorgi's profile
await db.updateGiorgiProfile(discordUserId, {
  latest_deployment_url: 'https://v0-login.vercel.app',
  deployment_status: 'success',
  tech_respect: 6,
  notes: 'Good first deployment. Clear requirements.',
});
```

### **Example 3: Giorgi Continues Editing**

```typescript
// Student: "Make the button blue"

// 1. Get existing chat ID
const profile = await db.getOrCreateGiorgiProfile(discordUserId);
const chatId = profile.vercelChatId; // Continue existing conversation

// 2. Use chatId to send to v0 API (in same chat)
// ... v0 API call ...

// 3. Save new deployment
await db.saveDeployment(discordUserId, 'https://v0-login-v2.vercel.app', {
  featureDescription: 'Changed button to blue',
  userPrompt: 'Make the button blue',
  vercelChatId: chatId,
  status: 'success',
  buildTimeSeconds: 18,
});

// 4. Update latest URL
await db.updateGiorgiProfile(discordUserId, {
  latest_deployment_url: 'https://v0-login-v2.vercel.app',
  deployment_status: 'success',
});
```

### **Example 4: Laura Checks Progress**

```typescript
// Laura: "How many times has Dachi deployed?"

const stats = await db.getDeploymentStats(discordUserId);
const studentProfile = await db.getOrCreateStudentProfile(discordUserId, 'dachi', 'Dachi');
const giorgiProfile = await db.getOrCreateGiorgiProfile(discordUserId);

const message = `
${studentProfile.name} is working on "${studentProfile.currentProject}".
Status: ${studentProfile.projectStatus}
Deployments: ${stats.totalDeployments} total (${stats.successfulDeployments} successful)
Latest: ${giorgiProfile.latestDeploymentUrl}
`;
```

---

## n8n Integration

### **Giorgi's Workflow Pattern**

```
┌─────────────┐
│  Webhook    │ ← Discord bot sends request
└──────┬──────┘
       │
       v
┌─────────────┐
│  Postgres   │ Get student profile + Giorgi profile
│  Get Profile│ (includes vercel_chat_id if exists)
└──────┬──────┘
       │
       v
┌─────────────┐
│  If/Switch  │ Is this a build request or chat?
└──┬────────┬─┘
   │        │
   │        └──────> Chat only ──> Response webhook
   │
   v
┌─────────────┐
│  Code Node  │ Check if vercel_chat_id exists
│             │ - If exists: continue conversation
│             │ - If null: create new project
└──────┬──────┘
       │
       v
┌─────────────┐
│  HTTP       │ Call v0 API
│  v0 API     │ - projectId, chatId, prompt
└──────┬──────┘
       │
       v
┌─────────────┐
│  Code Node  │ Start timer, extract deployment URL
└──────┬──────┘
       │
       v
┌─────────────┐
│  Postgres   │ 1. Save deployment record
│  Update     │ 2. Update giorgi_profiles
│             │    (vercel_chat_id, latest_deployment_url)
└──────┬──────┘
       │
       v
┌─────────────┐
│  Wrap Output│ Format response JSON
└──────┬──────┘
       │
       v
┌─────────────┐
│  HTTP Req   │ Send to Discord webhook callback
│  to Discord │
└─────────────┘
```

### **n8n PostgreSQL Queries**

#### **Get Giorgi Profile**
```sql
SELECT 
  sp.discord_user_id,
  sp.username,
  sp.current_project,
  sp.project_status,
  gp.vercel_project_id,
  gp.vercel_chat_id,
  gp.latest_deployment_url,
  gp.deployment_status,
  gp.tech_respect,
  gp.notes
FROM discord_bots.student_profiles sp
LEFT JOIN discord_bots.giorgi_profiles gp 
  ON gp.discord_user_id = sp.discord_user_id
WHERE sp.discord_user_id = '{{ $json.userId }}';
```

#### **Save Deployment**
```sql
INSERT INTO discord_bots.deployments 
  (discord_user_id, feature_description, user_prompt, deployment_url, vercel_chat_id, status, build_time_seconds)
VALUES 
  ('{{ $json.userId }}', 
   '{{ $json.featureDescription }}', 
   '{{ $json.userPrompt }}',
   '{{ $json.deploymentUrl }}',
   '{{ $json.chatId }}',
   'success',
   {{ $json.buildTimeSeconds }})
RETURNING *;
```

#### **Update Giorgi Profile After Deployment**
```sql
UPDATE discord_bots.giorgi_profiles
SET 
  vercel_project_id = '{{ $json.projectId }}',
  vercel_chat_id = '{{ $json.chatId }}',
  latest_deployment_url = '{{ $json.deploymentUrl }}',
  deployment_status = 'success',
  updated_at = CURRENT_TIMESTAMP
WHERE discord_user_id = '{{ $json.userId }}';
```

### **n8n Code Node Example**

```javascript
// Extract data from v0 API response
const v0Response = $input.item.json;
const startTime = $node["Start Timer"].json.timestamp;
const buildTime = Math.floor((Date.now() - startTime) / 1000);

return {
  json: {
    userId: $('Webhook').item.json.userId,
    username: $('Webhook').item.json.username,
    channelId: $('Webhook').item.json.channelId,
    featureDescription: 'Added login page', // or extract from AI
    userPrompt: $('Webhook').item.json.message,
    deploymentUrl: v0Response.deployment_url,
    projectId: v0Response.project_id,
    chatId: v0Response.chat_id,
    buildTimeSeconds: buildTime,
    status: 'success',
  }
};
```

---

## Common Patterns

### **Pattern 1: Check if Student Has Active Project**

```typescript
const profile = await db.getOrCreateStudentProfile(discordUserId, username);

if (!profile.currentProject || profile.projectStatus === 'not_started') {
  // No project yet, Laura needs to assign one
  return "You don't have a project yet. Laura will assign one soon.";
}

if (profile.projectStatus === 'completed') {
  // Project done, ready for new one
  return "Great job finishing your last project! Ready for the next challenge?";
}

// Has active project
return `You're working on: ${profile.currentProject}`;
```

### **Pattern 2: Continue Vercel Conversation**

```typescript
const giorgiProfile = await db.getOrCreateGiorgiProfile(discordUserId);

if (!giorgiProfile.vercelChatId) {
  // First deployment - create new project
  const v0Response = await createV0Project(userPrompt);
  await db.updateGiorgiVercelSession(
    discordUserId, 
    v0Response.projectId, 
    v0Response.chatId
  );
} else {
  // Continue existing conversation
  const v0Response = await continueV0Chat(
    giorgiProfile.vercelChatId, 
    userPrompt
  );
}
```

### **Pattern 3: Show Deployment History to Student**

```typescript
const history = await db.getDeploymentHistory(discordUserId, 5);

const message = history.map((d, i) => 
  `${i+1}. ${d.featureDescription} - ${d.status === 'success' ? '✅' : '❌'} - ${d.createdAt.toLocaleDateString()}`
).join('\n');

return `Your last 5 deployments:\n${message}`;
```

### **Pattern 4: Agent Notes (Private Observations)**

```typescript
// Laura's private notes (not visible to Giorgi or student)
await db.updateLauraProfile(discordUserId, {
  notes: 'Student seems overwhelmed. Missed 2 check-ins. Consider escalation.',
  tension_level: 8,
});

// Giorgi's private notes (not visible to Laura or student)
await db.updateGiorgiProfile(discordUserId, {
  notes: 'Great communicator. Provides detailed requirements. Prefers dark themes.',
  tech_respect: 9,
});

// Admin notes (visible to all agents)
await db.updateSharedStudentProfile(discordUserId, {
  admin_notes: 'Student has dyslexia - use simple language and bullet points',
});
```

---

## Summary

✅ **What Changed:**
- Agent-specific `notes` (private observations)
- Shared `admin_notes` for cross-agent visibility
- Project tracking in `student_profiles` (name, description, status)
- Vercel integration in `giorgi_profiles` (project ID, chat ID)
- Full `deployments` history table

✅ **Key Principles:**
1. **One project per student** (but can complete and start new ones)
2. **One Vercel project** (same chat ID throughout iterations)
3. **Multiple deployments** per project (track every iteration)
4. **Agent privacy** (each bot has private notes)
5. **Cross-agent visibility** (everyone sees project name/status)

✅ **Next Steps:**
1. Update n8n workflows to save deployments
2. Use `vercel_chat_id` to continue conversations
3. Track build times and success rates
4. Show deployment history to students

Need help? Check `discord-bots/sql/006_project_tracking.sql` for the complete migration.

