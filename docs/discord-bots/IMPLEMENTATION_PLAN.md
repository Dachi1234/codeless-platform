# Discord Multi-Agent Bots - Implementation Plan

**Created**: October 22, 2025  
**Estimated Timeline**: 5-7 days  
**Complexity**: Medium

---

## 🎯 Project Goal

Build a standalone Discord bot service hosting multiple AI agents (Laura, Luka, Nino) that can interact with students via Discord, store conversation history, and integrate with OpenAI Agent SDK.

---

## 📊 Implementation Phases

```
Phase 1: Foundation        [2-3 days]  ███████░░░░░░░░
Phase 2: Single Agent      [1-2 days]  ░░░░░░░███████░░
Phase 3: Multi-Agent       [1 day]     ░░░░░░░░░░░███░░
Phase 4: Polish & Deploy   [1 day]     ░░░░░░░░░░░░░███
```

**Total**: 5-7 days

---

## 📋 Phase 1: Foundation Setup (2-3 days)

### 1.1 Project Initialization (2 hours)

**Tasks**:
- [ ] Create `discord-bots/` directory in workspace
- [ ] Initialize npm project
- [ ] Set up TypeScript configuration
- [ ] Create folder structure
- [ ] Set up `.gitignore`
- [ ] Create `.env.example`

**Commands**:
```bash
cd c:\Users\Ryzen\Desktop\Codeless_Web
mkdir discord-bots
cd discord-bots
npm init -y
npm install discord.js openai pg dotenv
npm install -D typescript tsx @types/node @types/pg
npx tsc --init
```

**Deliverable**: Basic project structure with dependencies

---

### 1.2 Database Setup (3 hours)

**Tasks**:
- [ ] Create new database in Neon (separate from main platform)
- [ ] Write SQL schema (`sql/001_init.sql`)
- [ ] Test connection from local machine
- [ ] Create database utility functions
- [ ] Set up connection pooling

**Files to Create**:
- `sql/001_init.sql` - Database schema
- `src/database/connection.ts` - PostgreSQL pool setup
- `src/database/conversations.ts` - Conversation queries
- `src/database/messages.ts` - Message queries
- `src/database/students.ts` - Student profile queries

**Verification**:
```bash
# Test database connection
npm run test:db
```

**Deliverable**: Working database with schema

---

### 1.3 Discord Bot Setup (3 hours)

**Tasks**:
- [ ] Create Discord Application in Developer Portal
- [ ] Create 3 bot users (Laura, Luka, Nino)
- [ ] Enable Message Content Intent for all bots
- [ ] Generate bot tokens
- [ ] Create test Discord server
- [ ] Invite all 3 bots to test server

**Discord Portal Steps**:
1. Go to https://discord.com/developers/applications
2. Create "Laura Bot" application
3. In Bot tab:
   - Enable "Message Content Intent"
   - Enable "Server Members Intent"
   - Copy token → DISCORD_LAURA_TOKEN
4. In OAuth2 → URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Permissions: Read Messages, Send Messages, Read Message History
   - Copy invite URL
5. Repeat for Luka and Nino bots

**Files to Create**:
- `src/config/env.ts` - Environment variable loading
- `src/config/discord.ts` - Discord configuration
- `src/discord/client.ts` - Discord client setup

**Deliverable**: 3 bot accounts ready to use

---

### 1.4 Basic Discord Client (4 hours)

**Tasks**:
- [ ] Set up Discord.js client
- [ ] Connect to Discord Gateway
- [ ] Handle ready event
- [ ] Handle message events
- [ ] Test message reception
- [ ] Add basic logging

**Files to Create**:
- `src/index.ts` - Main entry point
- `src/discord/handlers/ready.ts` - Ready event handler
- `src/discord/handlers/message.ts` - Message event handler
- `src/discord/handlers/error.ts` - Error event handler
- `src/utils/logger.ts` - Logging utility

**Test Criteria**:
- [ ] Bot comes online in Discord
- [ ] Bot can receive messages
- [ ] Bot logs activity to console
- [ ] Bot handles errors gracefully

**Deliverable**: Working Discord client that can receive messages

---

## 📋 Phase 2: Single Agent Implementation (1-2 days)

### 2.1 OpenAI Integration (4 hours)

**Tasks**:
- [ ] Set up OpenAI client
- [ ] Create base agent class
- [ ] Implement Laura agent
- [ ] Test with simple prompts
- [ ] Handle OpenAI errors

**Files to Create**:
- `src/openai/client.ts` - OpenAI client setup
- `src/agents/base.ts` - Base agent class
- `src/agents/laura.ts` - Laura agent implementation
- `src/config/agents.ts` - Agent configurations

**Test with**:
```typescript
const laura = new LauraAgent();
const response = await laura.respond("I need help with my project");
console.log(response);
```

**Deliverable**: Working Laura agent that can generate responses

---

### 2.2 Conversation Context (3 hours)

**Tasks**:
- [ ] Load conversation history from database
- [ ] Build context window (last 15 messages)
- [ ] Format context for OpenAI
- [ ] Test context preservation across messages

**Files to Create**:
- `src/openai/context.ts` - Context management
- `src/database/context.ts` - Context queries

**Test Criteria**:
- [ ] Bot remembers previous messages
- [ ] Context window limited to 15 messages
- [ ] Old messages don't affect new conversations

**Deliverable**: Context-aware conversation

---

### 2.3 Database Storage (3 hours)

**Tasks**:
- [ ] Save incoming messages to database
- [ ] Save bot responses to database
- [ ] Create/retrieve conversations
- [ ] Update student profiles
- [ ] Test data persistence

**Test Criteria**:
- [ ] Messages appear in database
- [ ] Conversations are created automatically
- [ ] Student profiles are updated
- [ ] Historical messages can be retrieved

**Deliverable**: Full message persistence

---

### 2.4 End-to-End Laura Bot (2 hours)

**Tasks**:
- [ ] Integrate all components
- [ ] Test in Discord DMs
- [ ] Test in Discord channel with @mention
- [ ] Handle edge cases (empty messages, long messages)
- [ ] Add error messages to user

**Test Scenarios**:
1. DM to Laura → Bot responds
2. @Laura in channel → Bot responds
3. Message without @Laura → Bot ignores
4. Very long message → Bot chunks response
5. OpenAI error → Bot sends friendly error

**Deliverable**: Fully working Laura bot

---

## 📋 Phase 3: Multi-Agent System (1 day)

### 3.1 Agent Router (2 hours)

**Tasks**:
- [ ] Implement agent detection logic
- [ ] Route @Laura → Laura Agent
- [ ] Route @Luka → Luka Agent
- [ ] Route @Nino → Nino Agent
- [ ] Handle DM default (Laura)

**Files to Create**:
- `src/agents/router.ts` - Agent routing logic

**Logic**:
```typescript
function detectAgent(message: Message): AgentType {
  if (message.mentions.users.has(LAURA_ID)) return 'laura';
  if (message.mentions.users.has(LUKA_ID)) return 'luka';
  if (message.mentions.users.has(NINO_ID)) return 'nino';
  if (message.channel.isDMBased()) return 'laura'; // Default
  return null; // Ignore
}
```

**Deliverable**: Smart message routing

---

### 3.2 Additional Agents (3 hours)

**Tasks**:
- [ ] Implement Luka agent (Technical Lead)
- [ ] Implement Nino agent (QA Lead)
- [ ] Define agent personas/prompts
- [ ] Test each agent's personality
- [ ] Ensure agent isolation (no cross-talk)

**Files to Create**:
- `src/agents/luka.ts` - Luka agent
- `src/agents/nino.ts` - Nino agent
- `docs/discord-bots/AGENT_PROMPTS.md` - Agent prompt documentation

**Agent Personas**:
- **Laura**: Demanding VP, business-focused, impatient
- **Luka**: Patient technical mentor, code-focused, helpful
- **Nino**: QA expert, detail-oriented, quality-focused

**Deliverable**: 3 working agents with distinct personalities

---

### 3.3 Integration Testing (2 hours)

**Tasks**:
- [ ] Test switching between agents
- [ ] Test multiple agents in same channel
- [ ] Test conversation isolation
- [ ] Test concurrent conversations
- [ ] Test error scenarios

**Test Scenarios**:
1. Switch from Laura to Luka mid-conversation
2. Tag multiple agents in one message
3. Two students talking to different agents simultaneously
4. Agent responding to wrong mention

**Deliverable**: Robust multi-agent system

---

## 📋 Phase 4: Polish & Deployment (1 day)

### 4.1 Production Hardening (3 hours)

**Tasks**:
- [ ] Add rate limiting (5 messages/5 sec per user)
- [ ] Add comprehensive error handling
- [ ] Add retry logic for OpenAI API
- [ ] Add Discord message chunking (2000 char limit)
- [ ] Add graceful shutdown
- [ ] Add health check endpoint

**Files to Create**:
- `src/utils/rate-limiter.ts` - Rate limiting
- `src/utils/errors.ts` - Custom error classes
- `src/discord/utils/chunking.ts` - Message chunking

**Deliverable**: Production-ready code

---

### 4.2 Docker & Cloud Run Setup (2 hours)

**Tasks**:
- [ ] Create Dockerfile
- [ ] Create cloudbuild.yaml
- [ ] Test local Docker build
- [ ] Configure Cloud Run service
- [ ] Set up environment variables in Cloud Run
- [ ] Deploy to Cloud Run

**Files to Create**:
- `Dockerfile`
- `cloudbuild.yaml`
- `.dockerignore`
- `docs/discord-bots/DEPLOYMENT.md`

**Deliverable**: Deployed service on Cloud Run

---

### 4.3 Monitoring & Documentation (2 hours)

**Tasks**:
- [ ] Set up structured logging
- [ ] Configure Cloud Run logging
- [ ] Create README with setup instructions
- [ ] Document environment variables
- [ ] Create troubleshooting guide
- [ ] Add usage examples

**Files to Create**:
- `README.md`
- `docs/discord-bots/TROUBLESHOOTING.md`
- `docs/discord-bots/USAGE_EXAMPLES.md`

**Deliverable**: Complete documentation

---

## 📁 File Creation Checklist

### Root Level
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `.env.example`
- [ ] `.gitignore`
- [ ] `.dockerignore`
- [ ] `Dockerfile`
- [ ] `cloudbuild.yaml`
- [ ] `README.md`

### SQL
- [ ] `sql/001_init.sql`

### Source (`src/`)
- [ ] `src/index.ts`

### Config
- [ ] `src/config/env.ts`
- [ ] `src/config/discord.ts`
- [ ] `src/config/agents.ts`

### Database
- [ ] `src/database/connection.ts`
- [ ] `src/database/conversations.ts`
- [ ] `src/database/messages.ts`
- [ ] `src/database/students.ts`

### Discord
- [ ] `src/discord/client.ts`
- [ ] `src/discord/handlers/ready.ts`
- [ ] `src/discord/handlers/message.ts`
- [ ] `src/discord/handlers/error.ts`
- [ ] `src/discord/utils/permissions.ts`
- [ ] `src/discord/utils/formatting.ts`

### Agents
- [ ] `src/agents/base.ts`
- [ ] `src/agents/laura.ts`
- [ ] `src/agents/luka.ts`
- [ ] `src/agents/nino.ts`
- [ ] `src/agents/router.ts`

### OpenAI
- [ ] `src/openai/client.ts`
- [ ] `src/openai/runner.ts` (for Agent SDK)
- [ ] `src/openai/context.ts`

### Utilities
- [ ] `src/utils/logger.ts`
- [ ] `src/utils/rate-limiter.ts`
- [ ] `src/utils/errors.ts`

### Documentation
- [ ] `docs/discord-bots/ARCHITECTURE.md` ✅
- [ ] `docs/discord-bots/IMPLEMENTATION_PLAN.md` (this file)
- [ ] `docs/discord-bots/DEPLOYMENT.md`
- [ ] `docs/discord-bots/AGENT_PROMPTS.md`
- [ ] `docs/discord-bots/TROUBLESHOOTING.md`
- [ ] `docs/discord-bots/USAGE_EXAMPLES.md`

**Total Files**: ~40 files

---

## 🧪 Testing Strategy

### Unit Tests (Optional for MVP)
- Agent response generation
- Context building
- Message routing

### Integration Tests
- [ ] Discord client connects successfully
- [ ] Messages are received and processed
- [ ] Database queries work
- [ ] OpenAI API calls succeed
- [ ] All 3 agents respond correctly

### Manual Testing
- [ ] DM conversation with each agent
- [ ] Channel conversation with mentions
- [ ] Multi-user conversations
- [ ] Edge cases (long messages, errors, rate limits)

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All 3 Discord bots created
- [ ] Neon database created and schema applied
- [ ] OpenAI API key obtained
- [ ] Environment variables documented
- [ ] Code tested locally

### Cloud Run Setup
- [ ] Create Cloud Run service: `codeless-discord-bots`
- [ ] Set region: `europe-west1`
- [ ] Set memory: `512Mi`
- [ ] Set CPU: `1`
- [ ] Set min instances: `1`
- [ ] Set max instances: `3`
- [ ] Set timeout: `3600s`
- [ ] Configure environment variables
- [ ] Deploy container

### Post-Deployment
- [ ] Verify bots come online
- [ ] Test each agent in Discord
- [ ] Monitor logs in Cloud Console
- [ ] Check database for messages
- [ ] Monitor costs

---

## 💰 Cost Estimate

### Development
- **Time**: 5-7 days
- **OpenAI API Testing**: ~$5-10 (during development)

### Monthly Running Costs
- **Cloud Run**: ~$10-15/month (always-on instance)
- **Neon Database**: $0 (free tier sufficient)
- **OpenAI API**: Variable (depends on usage)
  - Estimated: $20-50/month for moderate usage

**Total**: ~$30-75/month

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API rate limits | High | Implement rate limiting, caching |
| Discord connection drops | High | Implement auto-reconnection |
| Database connection pool exhausted | Medium | Configure pool limits, monitoring |
| High OpenAI costs | Medium | Add usage limits, monitoring |
| Message spam | Medium | Rate limit per user |
| Cold start issues | Low | Min instances = 1 (always-on) |

---

## 📊 Success Metrics

### Phase 1 Success
- [ ] Bot connects to Discord ✅
- [ ] Database schema created ✅
- [ ] Messages stored in database ✅

### Phase 2 Success
- [ ] Laura responds to DMs ✅
- [ ] Laura responds to @mentions ✅
- [ ] Conversation context maintained ✅

### Phase 3 Success
- [ ] All 3 agents working ✅
- [ ] Agent routing correct ✅
- [ ] Distinct personalities evident ✅

### Phase 4 Success
- [ ] Deployed to Cloud Run ✅
- [ ] No errors in production ✅
- [ ] Documentation complete ✅

---

## 🎯 Next Steps After Completion

### Future Enhancements (Not in MVP)
1. **Slash Commands** - `/laura`, `/luka`, `/nino`
2. **Conversation Summaries** - Compress long conversations
3. **Student Memory** - Track student progress, preferences
4. **Custom Agent Configs** - Per-server customization
5. **Admin Dashboard** - Web UI for monitoring
6. **Advanced Tools** - Code execution, file analysis
7. **Webhooks** - Integration with platform events
8. **Analytics** - Usage statistics, popular topics

---

## 📅 Development Schedule

### Week 1
- **Day 1-2**: Phase 1 (Foundation)
- **Day 3**: Phase 2 (Single Agent)
- **Day 4**: Phase 3 (Multi-Agent)
- **Day 5**: Phase 4 (Deployment)

### Week 2 (If needed)
- Polish
- Testing
- Documentation
- Monitoring setup

---

## ✅ Definition of Done

A feature/phase is "done" when:
- [ ] Code is written and tested
- [ ] Works in local environment
- [ ] Works in production
- [ ] Documented
- [ ] No critical bugs
- [ ] Meets acceptance criteria

---

## 🤝 Getting Started

Ready to begin? Here's the first command to run:

```bash
cd c:\Users\Ryzen\Desktop\Codeless_Web
mkdir discord-bots
cd discord-bots
```

Then follow Phase 1.1 in this document!

---

**Document Status**: ✅ Complete  
**Next Step**: Begin Phase 1.1 - Project Initialization  
**Owner**: Development Team  
**Timeline**: 5-7 days

