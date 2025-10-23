# n8n Workflow Setup Guide

Complete guide to building AI agent workflows in n8n for Discord bots.

---

## 🎯 Overview

Your n8n workflow receives messages from Discord bot and returns AI responses.

**Flow**: Discord Bot → n8n Webhook → AI Processing → Response → Discord Bot

---

## 📊 Webhook Request Format

Your n8n workflow receives this JSON from the Discord bot:

```json
{
  "channelId": "1234567890123456789",
  "userId": "9876543210987654321",
  "username": "StudentName",
  "message": "What is polymorphism in Java?",
  "conversationContext": [
    {
      "sender": "user",
      "content": "Hi! I'm learning Java.",
      "timestamp": "2025-10-23T10:00:00.000Z"
    },
    {
      "sender": "laura",
      "content": "Hello! Great to hear you're learning Java. How can I help?",
      "timestamp": "2025-10-23T10:00:05.000Z"
    },
    {
      "sender": "user",
      "content": "What is polymorphism in Java?",
      "timestamp": "2025-10-23T10:01:00.000Z"
    }
  ]
}
```

### Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `channelId` | string | Discord channel ID (unique per conversation) |
| `userId` | string | Discord user ID (unique per student) |
| `username` | string | Discord username (e.g., "StudentName") |
| `message` | string | The current message from the student |
| `conversationContext` | array | Last N messages (student + agent) |

---

## ✅ Required Response Format

Your n8n workflow **must return**:

```json
{
  "response": "The agent's response text here..."
}
```

### Optional Metadata

You can include additional metadata (ignored by bot):

```json
{
  "response": "The agent's response text here...",
  "metadata": {
    "tokens": 150,
    "processingTime": 1234,
    "model": "gpt-4"
  }
}
```

---

## 🧪 Phase 1: Simple Echo Workflow (Testing)

### Purpose

Test that Discord bot ↔️ n8n communication works.

### Workflow

```
Webhook → Code → Respond to Webhook
```

### Code Node

```javascript
// Simple echo response for testing
const incomingMessage = $json.message;
const username = $json.username;
const context = $json.conversationContext || [];

return {
  response: `Hello ${username}! You said: "${incomingMessage}". 

I received ${context.length} messages in context. 

This is a test response from n8n! 🤖`
};
```

### Expected Behavior

User sends: `Hello Laura!`
Bot replies: `Hello StudentName! You said: "Hello Laura!". I received 1 messages in context. This is a test response from n8n! 🤖`

---

## 🤖 Phase 2: Basic AI Workflow

### Purpose

Add OpenAI for actual AI responses (no conversation memory yet).

### Workflow

```
Webhook → Code (Format) → OpenAI → Code (Format Response) → Respond to Webhook
```

### Node 1: Webhook

- **HTTP Method**: POST
- **Path**: `laura`
- **Respond**: `When Last Node Finishes`

### Node 2: Code (Format for OpenAI)

```javascript
// Format request for OpenAI
const message = $json.message;
const username = $json.username;

return {
  systemPrompt: `You are Laura, a friendly and knowledgeable programming teaching assistant. 
You help students learn programming concepts with clear explanations and examples.
Keep responses concise and encouraging.`,
  userMessage: `Student ${username} asks: ${message}`
};
```

### Node 3: OpenAI

- **Resource**: `Chat`
- **Model**: `gpt-4` (or `gpt-3.5-turbo`)
- **Messages**:
  - **System**: `{{ $json.systemPrompt }}`
  - **User**: `{{ $json.userMessage }}`

### Node 4: Code (Format Response)

```javascript
// Extract OpenAI response
const aiResponse = $json.choices[0].message.content;

return {
  response: aiResponse,
  metadata: {
    tokens: $json.usage?.total_tokens || 0,
    model: $json.model
  }
};
```

### Node 5: Respond to Webhook

- **Respond With**: `JSON`
- **Response Body**: `{{ $json }}`

---

## 🧠 Phase 3: Advanced AI with Context

### Purpose

Use conversation history for contextual responses.

### Workflow

```
Webhook → Code (Build Context) → OpenAI → Code (Format Response) → Respond to Webhook
```

### Node 2: Code (Build Conversation Context)

```javascript
// Build conversation context for OpenAI
const message = $json.message;
const username = $json.username;
const context = $json.conversationContext || [];

// System prompt
const systemPrompt = `You are Laura, a friendly and knowledgeable programming teaching assistant.
You help students learn programming concepts with clear explanations and examples.
Keep responses concise, encouraging, and contextual based on the conversation history.`;

// Build OpenAI messages array
const messages = [
  { role: 'system', content: systemPrompt }
];

// Add conversation history
for (const msg of context) {
  if (msg.sender === 'user') {
    messages.push({ role: 'user', content: msg.content });
  } else {
    // Agent message (laura, luka, nino)
    messages.push({ role: 'assistant', content: msg.content });
  }
}

// Add current message (already included in context, but double-check)
// Only add if not already in context
const lastContextMessage = context[context.length - 1];
if (!lastContextMessage || lastContextMessage.content !== message) {
  messages.push({ role: 'user', content: message });
}

return {
  messages: messages,
  username: username
};
```

### Node 3: OpenAI

- **Resource**: `Chat`
- **Model**: `gpt-4`
- **Messages**: Use expression:
  ```
  {{ $json.messages }}
  ```

### Node 4: Code (Format Response)

```javascript
// Extract OpenAI response
const aiResponse = $json.choices[0].message.content;
const username = $input.first().json.username;

return {
  response: aiResponse,
  metadata: {
    tokens: $json.usage?.total_tokens || 0,
    model: $json.model,
    username: username
  }
};
```

---

## 🗄️ Phase 4: RAG with PostgreSQL

### Purpose

Query your course database to provide accurate, course-specific answers.

### Workflow

```
Webhook → Code (Extract Intent) → Postgres Query → Code (Build Prompt) → OpenAI → Code (Format) → Respond
```

### Node 2: Code (Extract Search Intent)

```javascript
// Determine if we need to query database
const message = $json.message.toLowerCase();

// Keywords that trigger database lookup
const needsDB = 
  message.includes('course') || 
  message.includes('lesson') || 
  message.includes('module') ||
  message.includes('what is') ||
  message.includes('explain');

return {
  ...($json),
  needsDatabase: needsDB,
  searchQuery: message
};
```

### Node 3: IF Node

- **Condition**: `{{ $json.needsDatabase === true }}`
- **If True**: Go to Postgres node
- **If False**: Go directly to OpenAI

### Node 4: Postgres Query

- **Operation**: `Execute Query`
- **Query**:
  ```sql
  SELECT 
    c.title as course_title,
    c.description,
    m.title as module_title,
    l.title as lesson_title,
    l.content
  FROM 
    public.course c
    LEFT JOIN module m ON m.course_id = c.id
    LEFT JOIN lesson l ON l.module_id = m.id
  WHERE 
    l.content ILIKE '%{{ $json.searchQuery }}%'
    OR l.title ILIKE '%{{ $json.searchQuery }}%'
  LIMIT 5;
  ```

### Node 5: Code (Build Prompt with DB Results)

```javascript
// Build context from database results
const dbResults = $json || [];
const message = $input.first().json.message;
const username = $input.first().json.username;
const conversationContext = $input.first().json.conversationContext || [];

let courseContext = '';

if (dbResults.length > 0) {
  courseContext = '\n\nRelevant course information:\n';
  for (const row of dbResults) {
    courseContext += `\n**${row.course_title}** - ${row.lesson_title}:\n${row.content.substring(0, 500)}...\n`;
  }
}

// Build messages
const messages = [
  { 
    role: 'system', 
    content: `You are Laura, a programming teaching assistant.
${courseContext}

Use the course information above to provide accurate, contextual answers.
If the course info doesn't cover the topic, use your general knowledge.
Keep responses clear and encouraging.`
  }
];

// Add conversation history
for (const msg of conversationContext) {
  messages.push({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  });
}

return {
  messages: messages,
  hasDbContext: dbResults.length > 0
};
```

---

## 🔐 Security: Webhook Authentication

### Add Authentication Header

In your n8n Webhook node:
1. Click **"Add Option"**
2. Select **"Authentication"**
3. Choose **"Header Auth"**
4. Set **Header Name**: `Authorization`
5. Set **Value**: `Bearer your-secret-token`

### Update Discord Bot .env

```bash
N8N_WEBHOOK_AUTH_HEADER=Bearer your-secret-token
```

---

## 📊 Monitoring & Debugging

### Enable Workflow Logging

1. Go to workflow settings
2. Enable **"Save Execution Data"**
3. View executions in **"Executions"** tab

### Check Execution Logs

1. Click on any execution
2. View input/output for each node
3. Check for errors or unexpected data

### Common Issues

| Issue | Solution |
|-------|----------|
| Webhook returns 404 | Workflow is not active |
| No response from OpenAI | Check API key, model name |
| Database query fails | Verify connection string, table names |
| Response timeout | Reduce context size, optimize query |

---

## 🎯 Best Practices

### 1. Response Time

- Keep responses under 30 seconds
- Use `gpt-3.5-turbo` for faster responses
- Limit database queries (use indexes)

### 2. Token Usage

- Limit conversation context to 10-15 messages
- Truncate long messages
- Use concise system prompts

### 3. Error Handling

Add error handling nodes:

```javascript
// In a Code node after OpenAI
try {
  const response = $json.choices[0].message.content;
  return { response: response };
} catch (error) {
  return { 
    response: "I'm sorry, I'm having trouble processing your request right now. Please try again!" 
  };
}
```

### 4. Rate Limiting

- Use n8n's built-in rate limiting
- Set max concurrent executions
- Add queue for high traffic

---

## 🚀 Testing Your Workflow

### 1. Test with n8n UI

Click **"Execute Workflow"** → **"Manual Execution"**

Use this test payload:

```json
{
  "channelId": "test-channel",
  "userId": "test-user",
  "username": "TestStudent",
  "message": "What is polymorphism?",
  "conversationContext": []
}
```

### 2. Test with curl

```bash
curl -X POST https://your-instance.app.n8n.cloud/webhook/laura \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "test",
    "userId": "test-user",
    "username": "TestStudent",
    "message": "Hello Laura!",
    "conversationContext": []
  }'
```

### 3. Test with Discord Bot

Send a message to your bot and check:
- Discord bot logs show request sent
- n8n execution appears in executions list
- Response is received in Discord

---

## 📚 Example: Complete Laura Workflow

Download the example workflow JSON: `examples/laura-workflow.json`

Import steps:
1. Go to n8n
2. Click **"Import from File"**
3. Upload `laura-workflow.json`
4. Update credentials (OpenAI API key, Postgres connection)
5. Activate workflow

---

## 🤝 Multiple Agents

### Strategy 1: Separate Webhooks

- Laura: `/webhook/laura`
- Luka: `/webhook/luka`
- Nino: `/webhook/nino`

Each agent has its own workflow with unique personality.

### Strategy 2: Single Webhook with Routing

Use an IF node to route based on `agentName` field:

```javascript
// In first Code node
const agentName = $json.agentName || 'laura';

return {
  ...($json),
  isLaura: agentName === 'laura',
  isLuka: agentName === 'luka',
  isNino: agentName === 'nino'
};
```

Then use IF nodes to route to different OpenAI nodes with different prompts.

---

Need help? Test each node individually and check execution logs! 🚀

