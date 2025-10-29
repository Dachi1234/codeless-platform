import { Client, Message, ChannelType } from 'discord.js';
import { config, SingleBotConfig } from './config';
import { DatabaseService } from './services/database.service';
import { N8nService } from './services/n8n.service';

export class DiscordBot {
  private client: Client;
  private db: DatabaseService;
  private n8n: N8nService;
  private botConfig: SingleBotConfig;
  private botName: string;

  constructor(botConfig: SingleBotConfig) {
    this.botConfig = botConfig;
    this.botName = botConfig.name;

    this.client = new Client({
      intents: config.discord.intents,
      partials: config.discord.partials,
    });

    this.db = new DatabaseService();
    this.n8n = new N8nService(botConfig.n8nWebhookUrl, botConfig.responseTimeout);

    this.setupEventHandlers();
  }

  /**
   * Setup Discord event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('ready', () => this.onReady());
    this.client.on('messageCreate', (message) => this.onMessage(message));
    this.client.on('error', (error) => this.onError(error));
  }

  /**
   * Bot ready event
   */
  private async onReady(): Promise<void> {
    console.log('\n🤖 ===================================');
    console.log(`✅ Bot logged in as: ${this.client.user?.tag}`);
    console.log(`🎭 Agent: ${this.botName.toUpperCase()}`);
    console.log(`📊 Serving ${this.client.guilds.cache.size} servers`);
    console.log('🤖 ===================================\n');

    // Test database connection
    const dbOk = await this.db.testConnection();
    if (!dbOk) {
      console.error('❌ Database connection failed! Bot may not function properly.');
    }

    // Test n8n webhook (optional - won't fail startup)
    console.log('🔗 Testing n8n webhook connection...');
    await this.n8n.testWebhook();
  }

  /**
   * Handle incoming messages
   */
  private async onMessage(message: Message): Promise<void> {
    try {
      // Ignore bot messages
      if (message.author.bot) return;

      // Ignore empty messages
      if (!message.content || message.content.trim().length === 0) return;

      // Log message
      console.log(`\n💬 Message from ${message.author.tag}:`);
      console.log(`   Channel: ${message.channel.id} (${message.channel.type})`);
      console.log(`   Content: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}`);

      // Determine channel type
      let channelType: 'dm' | 'text' | 'thread';
      let guildId: string | null = null;
      let channelName: string | null = null;

      if (message.channel.type === ChannelType.DM) {
        channelType = 'dm';
      } else if (
        message.channel.type === ChannelType.PublicThread ||
        message.channel.type === ChannelType.PrivateThread
      ) {
        channelType = 'thread';
        guildId = message.guildId;
        channelName = message.channel.name || null;
      } else {
        channelType = 'text';
        guildId = message.guildId;
        if ('name' in message.channel) {
          channelName = message.channel.name || null;
        }
      }

      // Show typing indicator
      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }

      // Try to use database, but continue without it if it fails
      let conversationHistory: any[] = [];
      
      try {
        // Get or create conversation
        const conversation = await this.db.getOrCreateConversation(
          message.channel.id,
          channelType,
          guildId,
          channelName,
          this.botName
        );

        // Save student message
        await this.db.saveMessage(
          conversation.id,
          message.id,
          message.author.id,
          'student',
          message.content,
          this.botName
        );

        // Update student profile
        await this.db.getOrCreateStudentProfile(
          message.author.id,
          message.author.username,
          message.author.displayName || null
        );

        // Get conversation history
        conversationHistory = await this.db.getRecentMessages(
          conversation.id,
          this.botConfig.maxContextMessages
        );
      } catch (dbError) {
        console.warn('⚠️ Database unavailable, continuing without conversation history:', dbError);
        conversationHistory = [];
      }

      // Send to n8n and get agent response
      const { response: agentResponse, profileUpdates } = await this.n8n.sendToAgent(
        message.channel.id,
        message.author.id,
        message.author.username,
        message.content,
        conversationHistory
      );

      // Send response back to Discord
      const botMessage = await message.reply(agentResponse);

      // Try to save agent message and profile updates (if database is available)
      try {
        const conversation = await this.db.getOrCreateConversation(
          message.channel.id,
          channelType,
          guildId,
          channelName,
          this.botName
        );
        
        await this.db.saveMessage(
          conversation.id,
          botMessage.id,
          this.client.user?.id || 'bot',
          'agent',
          agentResponse,
          this.botName
        );

        // Update student profile if bot provided updates
        if (profileUpdates) {
          console.log(`📝 Updating student profile with ${this.botName}'s observations...`);
          await this.db.updateStudentProfile(message.author.id, profileUpdates);
        }
      } catch (dbError) {
        console.warn('⚠️ Could not save bot response or profile updates to database');
      }

      console.log(`✅ Response sent successfully`);
    } catch (error) {
      console.error('❌ Error handling message:', error);

      // Send error message to user
      try {
        await message.reply(
          "Sorry, I'm having trouble processing your message right now. Please try again later! 😔"
        );
      } catch (replyError) {
        console.error('❌ Failed to send error message:', replyError);
      }
    }
  }

  /**
   * Handle Discord client errors
   */
  private onError(error: Error): void {
    console.error('❌ Discord client error:', error);
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    try {
      console.log(`🚀 Starting Discord bot (${this.botName})...`);
      await this.client.login(this.botConfig.token);
    } catch (error) {
      console.error(`❌ Failed to start bot (${this.botName}):`, error);
      throw error;
    }
  }

  /**
   * Stop the bot gracefully
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping bot...');
    this.client.destroy();
    await this.db.close();
    console.log('✅ Bot stopped');
  }
}

