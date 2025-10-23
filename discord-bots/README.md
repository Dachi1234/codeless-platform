# Discord Multi-Agent Bots with n8n

AI-powered Discord bots that use n8n workflows for intelligent conversation management.

## 🎯 What This Is

Multi-agent Discord bot system where:
- **Discord Bot** handles messages and routing
- **n8n Cloud** manages AI workflows and agent logic
- **Neon PostgreSQL** stores conversation history
- **Bot-side routing** directs users to the right agent

---

## 📋 Prerequisites

Before you start, you need:

1. ✅ **Discord Bot Token** ([Create one](https://discord.com/developers/applications))
2. ✅ **n8n Cloud Account** (or self-hosted n8n)
3. ✅ **Neon Database** (PostgreSQL connection string)
4. ✅ **Node.js 18+** installed

---

## 🚀 Quick Start

### 1. Setup Database

```bash
cd sql/
# Follow instructions in sql/README.md
# Run 001_discord_schema.sql on your Neon database
```

### 2. Configure Environment

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your credentials:
# - DISCORD_BOT_TOKEN
# - DATABASE_URL
# - N8N_WEBHOOK_URL
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Mode

```bash
npm run dev
```

### 5. Test the Bot

Send a message to your bot on Discord! 🎉

---

## 📁 Project Structure

```
discord-bots/
├── src/
│   ├── index.ts              # Entry point
│   ├── bot.ts                # Main bot logic
│   ├── config.ts             # Configuration loader
│   └── services/
│       ├── database.service.ts   # PostgreSQL operations
│       └── n8n.service.ts        # n8n webhook client
├── sql/
│   └── 001_discord_schema.sql    # Database schema
├── env.example               # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_BOT_TOKEN` | ✅ | Your Discord bot token |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `N8N_WEBHOOK_URL` | ✅ | n8n webhook endpoint for your agent |
| `AGENT_NAME` | ⚠️ | Which agent this bot represents (default: laura) |
| `MAX_CONTEXT_MESSAGES` | ⚠️ | Number of messages to send as context (default: 10) |
| `AGENT_RESPONSE_TIMEOUT` | ⚠️ | Timeout in milliseconds (default: 30000) |
| `N8N_WEBHOOK_AUTH_HEADER` | ❌ | Optional webhook authentication token |

---

## 🔧 Development

### Run in Development Mode

```bash
npm run dev
```

Auto-reloads on file changes using `tsx watch`.

### Build for Production

```bash
npm run build
```

Compiles TypeScript to `dist/` folder.

### Run Production Build

```bash
npm start
```

Runs the compiled JavaScript from `dist/`.

---

## 🧪 Testing

### Test Database Connection

The bot automatically tests the database connection on startup.

### Test n8n Webhook

The bot sends a test request to n8n on startup (non-blocking).

### Manual Testing

1. Invite bot to your Discord server
2. Send a message in a channel or DM
3. Check logs for:
   - ✅ Message received
   - ✅ Database operations
   - ✅ n8n webhook call
   - ✅ Response sent

---

## 📊 Database Schema

The bot uses the `discord_bots` schema in your existing Neon database:

### Tables

- **`conversations`**: Discord channels/DMs as conversation sessions
- **`messages`**: All messages (student + agent) with full history
- **`student_profiles`**: Discord users who interact with bots

### Isolation

The `discord_bots` schema is **completely isolated** from your main platform's `public` schema.

---

## 🌐 n8n Integration

### Webhook Request Format

The bot sends this JSON to your n8n webhook:

```json
{
  "channelId": "1234567890",
  "userId": "9876543210",
  "username": "StudentName",
  "message": "What is polymorphism?",
  "conversationContext": [
    {
      "sender": "user",
      "content": "Hi!",
      "timestamp": "2025-10-23T10:00:00Z"
    },
    {
      "sender": "laura",
      "content": "Hello! How can I help?",
      "timestamp": "2025-10-23T10:00:05Z"
    }
  ]
}
```

### Expected n8n Response

Your n8n workflow must return:

```json
{
  "response": "The agent's response text here...",
  "metadata": {
    "tokens": 150,
    "processingTime": 1234
  }
}
```

Only the `response` field is required.

---

## 🚨 Error Handling

The bot handles:

- ✅ Database connection failures (logs error, continues startup)
- ✅ n8n webhook timeouts (sends error message to user)
- ✅ n8n 4xx/5xx errors (sends error message to user)
- ✅ Discord API errors (logs and continues)
- ✅ Graceful shutdown on SIGINT/SIGTERM

---

## 📝 Logging

### Log Levels

Configure with `LOG_LEVEL` environment variable:
- `debug`: All logs including detailed request/response
- `info`: Standard operational logs (default)
- `warn`: Warnings only
- `error`: Errors only

### What's Logged

- 💬 Every message received
- 📤 Every request to n8n (with payload size)
- 📥 Every response from n8n (with response size)
- ✅ Successful operations
- ❌ Errors with full stack traces

---

## 🔒 Security

### Environment Variables

- Never commit `.env` file
- Use strong database passwords
- Rotate Discord bot token regularly

### n8n Webhook

- Consider adding webhook authentication (`N8N_WEBHOOK_AUTH_HEADER`)
- Use HTTPS for production webhooks
- Validate webhook responses

### Database

- Use SSL for Neon connections (enabled by default)
- Schema isolation prevents conflicts with main platform
- Connection pooling limits resource usage

---

## 🐛 Troubleshooting

### Bot Won't Start

1. Check `DISCORD_BOT_TOKEN` is valid
2. Verify `DATABASE_URL` is correct
3. Ensure `N8N_WEBHOOK_URL` is accessible
4. Check Node.js version is 18+

### Database Errors

1. Run `001_discord_schema.sql` again
2. Check Neon console for connection limits
3. Verify SSL is enabled in connection string

### n8n Not Responding

1. Test webhook URL in browser/Postman
2. Check n8n workflow is activated
3. Verify webhook authentication if used
4. Check n8n execution logs

### Bot Not Replying

1. Check bot has `MessageContent` intent enabled
2. Verify bot has permission to read/send messages
3. Check logs for errors
4. Test with a simple message first

---

## 📚 Next Steps

1. **Setup n8n Workflow**: Follow `docs/discord-bots/N8N_SETUP_GUIDE.md`
2. **Deploy to Cloud Run**: Follow `docs/discord-bots/DEPLOYMENT.md`
3. **Add More Agents**: See `docs/discord-bots/MULTI_AGENT_SETUP.md`
4. **Monitor Performance**: Setup logging and metrics

---

## 🤝 Support

For issues or questions:
1. Check logs for error messages
2. Review architecture docs in `docs/discord-bots/`
3. Test components individually (DB, n8n, Discord)

---

## 📄 License

MIT

