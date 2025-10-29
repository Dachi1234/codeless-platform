import { DiscordBot } from './bot';
import { config } from './config';
import http from 'http';

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

  // Create HTTP health check server for Cloud Run
  const PORT = process.env.PORT || 8080;
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'running',
        bots: config.bots.map(b => b.name),
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
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

