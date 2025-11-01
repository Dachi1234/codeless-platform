import { Client, Message, ChannelType } from 'discord.js';
import { config, SingleBotConfig } from './config';
import { DatabaseService } from './services/database.service';
import { N8nService } from './services/n8n.service';

export class DiscordBot {
  private client: Client;
  private db: DatabaseService;
  private n8n: N8nService;
  private botConfig: SingleBotConfig;
  public botName: string; // Public so index.ts can access it

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
      let agentProfile: any = null;
      
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

        // Update student profile (shared data)
        await this.db.getOrCreateStudentProfile(
          message.author.id,
          message.author.username,
          message.author.displayName || null
        );

        // Get agent-specific profile
        if (this.botName === 'laura') {
          agentProfile = await this.db.getOrCreateLauraProfile(message.author.id);
        } else if (this.botName === 'giorgi') {
          agentProfile = await this.db.getOrCreateGiorgiProfile(message.author.id);
        }

        // Get conversation history
        conversationHistory = await this.db.getRecentMessages(
          conversation.id,
          this.botConfig.maxContextMessages
        );
      } catch (dbError) {
        console.warn('⚠️ Database unavailable, continuing without conversation history:', dbError);
        conversationHistory = [];
        agentProfile = null;
      }

      // Send to n8n - supports both sync and async patterns
      const n8nResponse = await this.n8n.sendToAgent(
        message.channel.id,
        message.author.id,
        message.author.username,
        message.content,
        conversationHistory,
        agentProfile
      );

      // Check which pattern n8n used
      if (n8nResponse.acknowledged) {
        // ⏳ Async pattern: n8n is processing, will send callback later
        try {
          await message.react('⏳');
          console.log(`⏳ Async processing started for message from ${message.author.username}`);
          console.log(`   Response will be sent via webhook callback when ready`);
        } catch (reactionError) {
          console.warn('⚠️ Could not add loading reaction:', reactionError);
        }
        // The actual response will come via webhook callback (see handleAsyncResponse method)
        
      } else if (n8nResponse.response) {
        // ✅ Sync pattern: n8n responded immediately, send it now
        console.log(`✅ Sync response received, sending to Discord`);
        
        const botMessage = await message.reply(n8nResponse.response);

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
            n8nResponse.response,
            this.botName
          );

          // Update student profile if bot provided updates
          if (n8nResponse.profile_updates) {
            console.log(`📝 Updating student profile with ${this.botName}'s observations...`);
            await this.db.updateStudentProfile(message.author.id, n8nResponse.profile_updates, this.botName);
          }
        } catch (dbError) {
          console.warn('⚠️ Could not save bot response or profile updates to database');
        }

        console.log(`✅ Sync response sent successfully`);
      } else {
        // This shouldn't happen - n8n returned neither sync nor async response
        console.error('❌ Invalid n8n response: missing both "response" and "acknowledged"');
        await message.reply("Sorry, I got an unexpected response format. Please try again! 😔");
      }
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
   * Handle async response from n8n webhook callback
   */
  async handleAsyncResponse(data: {
    channelId: string;
    userId: string;
    username: string;
    displayName?: string;
    agentName: string;
    response: string;
    profileUpdates?: any;
    webUrl?: string;
    deploymentId?: string;
  }): Promise<void> {
    try {
      console.log(`📨 Processing async response for ${data.agentName} in channel ${data.channelId}`);

      // Get the Discord channel
      const channel = await this.client.channels.fetch(data.channelId);
      
      if (!channel) {
        console.error(`❌ Channel not found: ${data.channelId}`);
        return;
      }

      if (!channel.isTextBased()) {
        console.error(`❌ Channel is not text-based: ${data.channelId}`);
        return;
      }

      // Format the response message
      let responseText = data.response;
      
      // Add deployment link if present
      if (data.webUrl) {
        responseText += `\n\n🔗 **Deployment:** ${data.webUrl}`;
      }

      // Send the message to Discord (check if channel supports sending)
      if (!('send' in channel)) {
        console.error(`❌ Channel does not support sending messages: ${data.channelId}`);
        return;
      }
      
      const botMessage = await channel.send(responseText);

      console.log(`✅ Async response sent to Discord channel ${data.channelId}`);

      // Save to database
      try {
        // Determine channel type
        let channelType: 'dm' | 'text' | 'thread' = 'text';
        let guildId: string | null = null;
        let channelName: string | null = null;

        if (channel.type === ChannelType.DM) {
          channelType = 'dm';
        } else if (channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread) {
          channelType = 'thread';
          if ('guild' in channel && channel.guild) {
            guildId = channel.guild.id;
          }
          if ('name' in channel) {
            channelName = channel.name || null;
          }
        } else {
          channelType = 'text';
          if ('guild' in channel && channel.guild) {
            guildId = channel.guild.id;
          }
          if ('name' in channel) {
            channelName = channel.name || null;
          }
        }

        // Get or create conversation
        const conversation = await this.db.getOrCreateConversation(
          data.channelId,
          channelType,
          guildId,
          channelName,
          this.botName
        );

        // Save bot message
        await this.db.saveMessage(
          conversation.id,
          botMessage.id,
          this.client.user?.id || 'bot',
          'agent',
          responseText,
          this.botName
        );

        // Update student profile if updates provided
        // Support both camelCase (profileUpdates) and snake_case (profile_updates)
        const profileUpdates = data.profileUpdates || (data as any).profile_updates;
        
        if (profileUpdates) {
          console.log(`📝 Updating student profile with ${this.botName}'s observations...`);
          await this.db.updateStudentProfile(data.userId, profileUpdates, this.botName);
        }

        // Save deployment if this was a deployment response (Giorgi only)
        if (this.botName === 'giorgi' && data.deploymentId && data.webUrl) {
          console.log(`📦 Saving deployment record...`);
          try {
            await this.db.saveDeployment(data.userId, data.webUrl, {
              featureDescription: profileUpdates?.current_project || profileUpdates?.project_description || 'Deployment',
              userPrompt: undefined, // Could add this to callback if needed
              deploymentId: data.deploymentId,
              vercelChatId: profileUpdates?.vercel_chat_id,
              status: profileUpdates?.deployment_status === 'success' ? 'success' : 'failed',
              errorMessage: profileUpdates?.deployment_status === 'failed' ? 'Deployment failed' : undefined,
              buildTimeSeconds: undefined // Could calculate this if we track start time
            });
            console.log(`✅ Deployment saved to database`);
          } catch (deployError) {
            console.warn('⚠️ Could not save deployment record:', deployError);
          }
        }

        console.log(`✅ Async response saved to database`);
      } catch (dbError) {
        console.warn('⚠️ Could not save async response to database:', dbError);
      }
    } catch (error) {
      console.error('❌ Error handling async response:', error);
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

