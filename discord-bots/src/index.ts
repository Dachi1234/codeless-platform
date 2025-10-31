import { DiscordBot } from './bot';
import { config } from './config';
import http from 'http';
import { ChannelType } from 'discord.js';

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Main function
async function main() {
  console.log('🚀 Initializing Multi-Bot Discord Service...');
  console.log(`📊 Configured bots: ${config.bots.map(b => b.name).join(', ')}`);

  // Create bot instances for each configured bot
  const bots = config.bots.map((botConfig) => {
    console.log(`🤖 Creating bot instance: ${botConfig.name}`);
    return new DiscordBot(botConfig);
  });

  // Create HTTP server for health checks AND webhook callbacks
  const PORT = process.env.PORT || 8080;
  // Strip BOM character if present (from PowerShell script that created the secret)
  const WEBHOOK_SECRET = (process.env.WEBHOOK_SECRET || 'change-me-in-production').replace(/^\uFEFF/, '');
  
  const server = http.createServer(async (req, res) => {
    // Health check endpoint
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'running',
        bots: config.bots.map(b => b.name),
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Webhook callback endpoint from n8n
    if (req.url === '/webhook/agent-response' && req.method === 'POST') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          
          // Verify webhook secret for security
          const authHeader = req.headers['authorization'];
          const expectedHeader = `Bearer ${WEBHOOK_SECRET}`;
          
          // Debug logging
          console.log('🔍 Auth Debug:', {
            received: authHeader,
            receivedLength: authHeader?.length,
            expected: expectedHeader,
            expectedLength: expectedHeader.length,
            secretLength: WEBHOOK_SECRET.length,
            match: authHeader === expectedHeader
          });
          
          if (authHeader !== expectedHeader) {
            console.warn('⚠️ Webhook received with invalid secret');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
          }

          console.log('📨 Received webhook callback from n8n:', {
            agentName: data.agentName,
            channelId: data.channelId,
            userId: data.userId,
            hasResponse: !!data.response
          });

          // Find the bot that should handle this response
          const bot = bots.find(b => b.botName === data.agentName);
          if (!bot) {
            console.error(`❌ No bot found for agent: ${data.agentName}`);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bot not found' }));
            return;
          }

          // Handle the async response
          await bot.handleAsyncResponse(data);

          // Respond to n8n
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          console.error('❌ Error processing webhook:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });

      req.on('error', (error) => {
        console.error('❌ Error reading webhook request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      });

      return;
    }

    // 404 for all other routes
    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(PORT, () => {
    console.log(`✅ Health check server listening on port ${PORT}`);
  });

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
    try {
      server.close();
      // Stop all bots
      await Promise.all(bots.map(bot => bot.stop()));
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Start all bots
  console.log(`\n🚀 Starting ${bots.length} bot(s)...\n`);
  await Promise.all(bots.map(bot => bot.start()));
  
  console.log(`\n✅ All ${bots.length} bot(s) are now online!\n`);
}

// Run
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

