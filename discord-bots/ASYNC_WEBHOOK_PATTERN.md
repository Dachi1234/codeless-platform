# Hybrid Sync/Async Pattern for Discord Bots

**Date:** October 31, 2025  
**Problem Solved:** Cloudflare/proxy timeouts on long-running n8n workflows  
**Solution:** Unified bot code that supports BOTH sync and async patterns - n8n decides which to use

---

## 🎯 Problem

Some n8n workflows complete quickly (<10 seconds), others take much longer (2+ minutes):

**Quick workflows (sync):**
- Simple conversations
- Knowledge retrieval
- Quick calculations

**Long workflows (async):**
- v0 deployments (2.6+ minutes)
- Complex multi-step tasks
- External API calls with long waits

**Issue:** HTTP proxies (Cloudflare, etc.) typically have 60-100 second timeouts. Long workflows return HTTP 524 timeout errors, even though n8n continues processing successfully in the background.

---

## ✅ Solution: Unified Sync/Async Pattern (n8n Decides)

**All bots (Laura, Giorgi, Nino) support BOTH patterns automatically!**

n8n workflows can respond in TWO ways, and the bot handles both:

### **Pattern 1: Sync (Quick Response)**
For workflows that complete quickly:
- Discord bot → HTTP POST to n8n
- n8n processes and responds: `{"response": "Here's your answer!", "profile_updates": {...}}`
- Discord bot replies immediately
- ✅ Fast, simple, no extra complexity

### **Pattern 2: Async (Long Processing)**
For workflows that take a long time:
- Discord bot → HTTP POST to n8n
- n8n immediately responds: `{"acknowledged": true, "status": "processing"}`
- Discord bot adds ⏳ reaction
- n8n continues processing in background (can take any amount of time)
- When done, n8n makes HTTP POST to Discord bot's webhook
- Discord bot sends the final response
- ✅ No timeouts, works for any workflow duration

**The bot automatically detects which pattern n8n used and handles it correctly!**

---

## 🔧 Implementation

### **1. n8n Workflow Changes**

Your n8n workflow must be structured like this:

```
┌──────────┐
│ Webhook  │ (receives message from Discord bot)
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ Respond to Webhook  │ ← IMMEDIATE response (within 1 second)
└──────────┬──────────┘
           │            Response: {"acknowledged": true, "status": "processing"}
           │
           ▼
┌───────────────────┐
│ Check Profile     │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ AI Agent          │ (takes 2+ minutes)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Code Node         │ (format response)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ HTTP Request      │ ← POST back to Discord bot webhook
└───────────────────┘   URL: https://[cloud-run-url]/webhook/agent-response
```

---

### **Step-by-Step n8n Configuration:**

#### **Step 1: Add "Respond to Webhook" Node (Immediate)**

Place this **immediately after** the Webhook trigger node:

**Node:** `Respond to Webhook`  
**Response Data:** `Using Fields Below`  
**Response Body:**
```json
{
  "acknowledged": true,
  "status": "processing"
}
```

**Important:** This must be the FIRST thing after the webhook, before any database queries or AI processing!

---

#### **Step 2: Remove Old Response Node**

If you have a "Respond to Webhook" node at the END of your workflow, **delete it**. You can only respond to a webhook once, and we already responded in Step 1.

---

#### **Step 3: Add HTTP Request Node at the End**

Place this as the **last node** in your workflow:

**Node:** `HTTP Request`  
**Method:** `POST`  
**URL:** `https://discord-bot-laura-[hash].a.run.app/webhook/agent-response`  
(Get your Cloud Run URL from: https://console.cloud.google.com/run)

**Authentication:** `Header Auth`
- **Name:** `Authorization`
- **Value:** `Bearer YOUR_WEBHOOK_SECRET_HERE`

**Body Content Type:** `JSON`  
**Specify Body:** `Using JSON`  
**JSON:**
```json
{
  "channelId": "{{ $('Webhook').item.json.channelId }}",
  "userId": "{{ $('Webhook').item.json.userId }}",
  "username": "{{ $('Webhook').item.json.username }}",
  "displayName": "{{ $('Webhook').item.json.displayName || $('Webhook').item.json.username }}",
  "agentName": "giorgi",
  "response": "{{ $json.response }}",
  "profileUpdates": {{ $json.profile_updates || null }},
  "webUrl": "{{ $json.webUrl || null }}",
  "deploymentId": "{{ $json.deploymentId || null }}"
}
```

**Note:** Adjust the field references based on your workflow. The response and profile_updates typically come from a Code node that formats the AI Agent's output.

---

### **2. Discord Bot Changes (Already Implemented)**

✅ **New endpoint:** `POST /webhook/agent-response`  
✅ **Updated bot logic:** Uses `sendToAgentAsync()` with 10-second timeout  
✅ **Loading reaction:** Adds ⏳ to show processing  
✅ **Async response handler:** `handleAsyncResponse()` method  

---

### **3. Google Secret Manager Setup**

Create a new secret for the webhook callback:

```powershell
# Generate a secure random secret
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Output "Generated secret: $secret"

# Save to file temporarily
[System.IO.File]::WriteAllText("temp-webhook-secret.txt", $secret, [System.Text.Encoding]::UTF8)

# Create secret in Google Secret Manager
gcloud secrets create DISCORD_WEBHOOK_SECRET --data-file="temp-webhook-secret.txt" --project=codeless-platform

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding DISCORD_WEBHOOK_SECRET `
  --member="serviceAccount:231098067761-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor" `
  --project=codeless-platform

# Clean up
Remove-Item temp-webhook-secret.txt

# Copy the secret to use in n8n
Write-Output "Use this secret in n8n HTTP Request Authorization header: Bearer $secret"
```

---

## 📊 Flow Diagram

```
User: @Giorgi help me build a todo app
   ↓
Discord Bot receives message
   ↓
Discord Bot → POST to n8n webhook
   ↓ [0.5 seconds]
n8n: Respond to Webhook → {"acknowledged": true} ✅
   ↓
Discord Bot: Adds ⏳ reaction
   ↓
[n8n processes in background for 2.6 minutes...]
   ↓
   • Check Profile
   • AI Agent determines intent
   • Generate v0 prompt
   • Create v0 project
   • Wait for build
   • Deploy to Vercel
   ↓
n8n: HTTP Request → POST to Discord Bot webhook
   {
     "channelId": "...",
     "userId": "...",
     "agentName": "giorgi",
     "response": "I've built your todo app!",
     "webUrl": "https://v0-...vercel.app"
   }
   ↓
Discord Bot webhook: Sends message to Discord
   ↓
Discord Bot webhook: Saves to PostgreSQL
   ↓
User sees: "I've built your todo app! 🔗 Deployment: https://..."
```

---

## 🔒 Security

The webhook callback is protected by:

1. **Shared Secret:** n8n must include `Authorization: Bearer YOUR_SECRET` header
2. **Cloud Run Identity:** Only requests from n8n's IP can reach the endpoint (optionally configure Cloud Armor)
3. **HTTPS:** All traffic is encrypted

---

## 🧪 Testing

### **Test n8n Acknowledgment**

```powershell
$payload = @{
    sessionId = "test-123"
    channelId = "test-123"
    userId = "test-user"
    username = "TestStudent"
    message = "Hello Giorgi!"
    conversationContext = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://codelessdigital.app.n8n.cloud/webhook/Giorgi" -Method POST -Body $payload -ContentType "application/json"
```

**Expected response (< 1 second):**
```json
{
  "acknowledged": true,
  "status": "processing"
}
```

---

### **Test Webhook Callback**

```powershell
$secret = "YOUR_WEBHOOK_SECRET_FROM_GOOGLE_SECRET_MANAGER"

$payload = @{
    channelId = "YOUR_DISCORD_CHANNEL_ID"
    userId = "YOUR_DISCORD_USER_ID"
    username = "TestUser"
    displayName = "Test User"
    agentName = "giorgi"
    response = "Test response from n8n! This is how async responses work."
    profileUpdates = @{
        tension_level = 6
        tech_respect = 7
    }
    webUrl = "https://example.com"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://discord-bot-laura-[hash].a.run.app/webhook/agent-response" `
  -Method POST `
  -Headers @{"Authorization" = "Bearer $secret"; "Content-Type" = "application/json"} `
  -Body $payload
```

**Expected:**
- Discord bot receives webhook
- Message appears in Discord channel
- Response: `{"success": true}`

---

## 🐛 Troubleshooting

### **Problem: Still getting 524 timeout**
- **Cause:** "Respond to Webhook" node is not immediately after Webhook trigger
- **Fix:** Move it to be the FIRST node after Webhook

### **Problem: 401 Unauthorized on webhook callback**
- **Cause:** Wrong secret or missing Authorization header
- **Fix:** Check that n8n HTTP Request node has `Authorization: Bearer YOUR_SECRET`

### **Problem: Bot doesn't send message to Discord**
- **Cause:** Channel ID is wrong or bot lacks permissions
- **Fix:** Check Cloud Run logs for error details

### **Problem: Response is sent but not saved to database**
- **Cause:** Database connection issue (non-critical)
- **Fix:** Check database credentials and Neon auto-suspend settings

---

## 📈 Benefits

| Metric | Before (Sync) | After (Async) |
|--------|---------------|---------------|
| **Timeout errors** | ❌ Every time (>100s) | ✅ None |
| **User experience** | ⏳ 2.6 min wait → error | ⏳ Instant reaction → response when ready |
| **n8n workflow** | Fails at 100s | ✅ Runs to completion |
| **Scalability** | ❌ Limited by timeout | ✅ Any workflow length |

---

## 🚀 Deployment

Once code is deployed:

1. ✅ Push code to Git (already done)
2. ✅ Cloud Build deploys automatically
3. ⏳ Create `DISCORD_WEBHOOK_SECRET` in Google Secret Manager (see command above)
4. ⏳ Update n8n workflows (both Laura and Giorgi):
   - Add immediate "Respond to Webhook" node
   - Add final HTTP Request node to callback
5. ⏳ Test with `@Giorgi help me build something`

---

## 📝 n8n Workflow Checklist

For **each bot** (Laura, Giorgi, Nino):

- [ ] "Respond to Webhook" node is FIRST after Webhook trigger
- [ ] Response is: `{"acknowledged": true, "status": "processing"}`
- [ ] No other "Respond to Webhook" nodes in workflow
- [ ] HTTP Request node is LAST in workflow
- [ ] HTTP Request URL is correct Cloud Run endpoint
- [ ] HTTP Request has Authorization header with webhook secret
- [ ] HTTP Request body includes: channelId, userId, agentName, response
- [ ] Workflow is ACTIVE (not in test mode)

---

**Questions?** Check Cloud Run logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=discord-bot-laura" --limit 50 --format json
```

