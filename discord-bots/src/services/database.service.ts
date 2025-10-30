import { Pool, PoolClient } from 'pg';
import { config } from '../config';

export interface Conversation {
  id: number;
  channelId: string;
  channelType: 'dm' | 'text' | 'thread';
  guildId: string | null;
  channelName: string | null;
  createdAt: Date;
  lastActivity: Date;
}

export interface Message {
  id: number;
  conversationId: number;
  discordMessageId: string;
  senderId: string;
  senderType: 'student' | 'agent';
  agentName: string | null;
  content: string;
  createdAt: Date;
}

export interface StudentProfile {
  discordUserId: string;
  username: string;
  displayName: string | null;
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
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000, // Increased for Neon cold starts
      query_timeout: 20000, // Query timeout: 20 seconds
    });

    this.pool.on('error', (err: Error) => {
      console.error('❌ Unexpected database error:', err);
    });
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT NOW()');
      console.log('✅ Database connected:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Get or create a conversation for a Discord channel
   */
  async getOrCreateConversation(
    channelId: string,
    channelType: 'dm' | 'text' | 'thread',
    guildId: string | null = null,
    channelName: string | null = null,
    botName: string = 'laura'
  ): Promise<Conversation> {
    const client = await this.pool.connect();
    try {
      // Try to get existing conversation for this channel and bot
      const existingResult = await client.query<Conversation>(
        'SELECT * FROM discord_bots.conversations WHERE channel_id = $1 AND bot_name = $2',
        [channelId, botName]
      );

      if (existingResult.rows.length > 0) {
        // Update last activity
        await client.query(
          'UPDATE discord_bots.conversations SET last_activity = NOW() WHERE channel_id = $1',
          [channelId]
        );
        return existingResult.rows[0];
      }

      // Create new conversation
      const insertResult = await client.query<Conversation>(
        `INSERT INTO discord_bots.conversations 
         (channel_id, channel_type, guild_id, channel_name, bot_name) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [channelId, channelType, guildId, channelName, botName]
      );

      return insertResult.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Save a message to the database
   */
  async saveMessage(
    conversationId: number,
    discordMessageId: string,
    senderId: string,
    senderType: 'student' | 'agent',
    content: string,
    botName: string | null = null
  ): Promise<Message> {
    const result = await this.pool.query<Message>(
      `INSERT INTO discord_bots.messages 
       (conversation_id, discord_message_id, sender_id, sender_type, content, agent_name, bot_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [conversationId, discordMessageId, senderId, senderType, content, botName, botName]
    );

    return result.rows[0];
  }

  /**
   * Get recent messages for a conversation (for context)
   */
  async getRecentMessages(
    conversationId: number,
    limit: number = 10
  ): Promise<Message[]> {
    const result = await this.pool.query<Message>(
      `SELECT * FROM discord_bots.messages 
       WHERE conversation_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [conversationId, limit]
    );

    // Reverse to get chronological order
    return result.rows.reverse();
  }

  /**
   * Get or create student profile
   */
  async getOrCreateStudentProfile(
    discordUserId: string,
    username: string,
    displayName: string | null = null
  ): Promise<StudentProfile> {
    const client = await this.pool.connect();
    try {
      // Try to get existing profile
      const existingResult = await client.query<StudentProfile>(
        'SELECT * FROM discord_bots.student_profiles WHERE discord_user_id = $1',
        [discordUserId]
      );

      if (existingResult.rows.length > 0) {
        // Update last seen and increment message count
        const updateResult = await client.query<StudentProfile>(
          `UPDATE discord_bots.student_profiles 
           SET last_seen_at = NOW(), 
               message_count = message_count + 1,
               username = $2,
               display_name = $3
           WHERE discord_user_id = $1 
           RETURNING *`,
          [discordUserId, username, displayName]
        );
        return updateResult.rows[0];
      }

      // Create new profile
      const insertResult = await client.query<StudentProfile>(
        `INSERT INTO discord_bots.student_profiles 
         (discord_user_id, username, display_name, message_count) 
         VALUES ($1, $2, $3, 1) 
         RETURNING *`,
        [discordUserId, username, displayName]
      );

      return insertResult.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Get or create Laura's profile for a student
   */
  async getOrCreateLauraProfile(discordUserId: string): Promise<LauraProfile> {
    const client = await this.pool.connect();
    try {
      // Try to get existing profile
      const existingResult = await client.query<LauraProfile>(
        'SELECT * FROM discord_bots.laura_profiles WHERE discord_user_id = $1',
        [discordUserId]
      );

      if (existingResult.rows.length > 0) {
        return existingResult.rows[0];
      }

      // Create new profile with defaults
      const insertResult = await client.query<LauraProfile>(
        `INSERT INTO discord_bots.laura_profiles 
         (discord_user_id, tension_level, trust_level, message_count) 
         VALUES ($1, 5, 5, 0) 
         RETURNING *`,
        [discordUserId]
      );

      return insertResult.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Get or create Giorgi's profile for a student
   */
  async getOrCreateGiorgiProfile(discordUserId: string): Promise<GiorgiProfile> {
    const client = await this.pool.connect();
    try {
      // Try to get existing profile
      const existingResult = await client.query<GiorgiProfile>(
        'SELECT * FROM discord_bots.giorgi_profiles WHERE discord_user_id = $1',
        [discordUserId]
      );

      if (existingResult.rows.length > 0) {
        return existingResult.rows[0];
      }

      // Create new profile with defaults
      const insertResult = await client.query<GiorgiProfile>(
        `INSERT INTO discord_bots.giorgi_profiles 
         (discord_user_id, tension_level, trust_level, message_count, tech_respect, code_quality) 
         VALUES ($1, 5, 5, 0, 5, 5) 
         RETURNING *`,
        [discordUserId]
      );

      return insertResult.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Update Laura's profile
   */
  async updateLauraProfile(
    discordUserId: string,
    updates: {
      tension_level?: number;
      trust_level?: number;
      last_milestone?: string;
      blocked?: boolean;
      priority?: string;
    }
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      const setParts: string[] = [];
      const values: any[] = [discordUserId];
      let paramIndex = 2;

      if (updates.tension_level !== undefined) {
        setParts.push(`tension_level = $${paramIndex++}`);
        values.push(updates.tension_level);
      }

      if (updates.trust_level !== undefined) {
        setParts.push(`trust_level = $${paramIndex++}`);
        values.push(updates.trust_level);
      }

      if (updates.last_milestone !== undefined) {
        setParts.push(`last_milestone = $${paramIndex++}`);
        values.push(updates.last_milestone);
      }

      if (updates.blocked !== undefined) {
        setParts.push(`blocked = $${paramIndex++}`);
        values.push(updates.blocked);
      }

      if (updates.priority !== undefined) {
        setParts.push(`priority = $${paramIndex++}`);
        values.push(updates.priority);
      }

      if (setParts.length === 0) {
        return; // Nothing to update
      }

      setParts.push('message_count = message_count + 1');
      setParts.push('last_interaction = NOW()');

      await client.query(
        `UPDATE discord_bots.laura_profiles 
         SET ${setParts.join(', ')}
         WHERE discord_user_id = $1`,
        values
      );

      console.log(`✅ Updated Laura profile for ${discordUserId}:`, updates);
    } finally {
      client.release();
    }
  }

  /**
   * Update Giorgi's profile
   */
  async updateGiorgiProfile(
    discordUserId: string,
    updates: {
      tension_level?: number;
      trust_level?: number;
      tech_respect?: number;
      code_quality?: number;
      current_stack?: string;
      blocker?: string;
      student_type?: string;
    }
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      const setParts: string[] = [];
      const values: any[] = [discordUserId];
      let paramIndex = 2;

      if (updates.tension_level !== undefined) {
        setParts.push(`tension_level = $${paramIndex++}`);
        values.push(updates.tension_level);
      }

      if (updates.trust_level !== undefined) {
        setParts.push(`trust_level = $${paramIndex++}`);
        values.push(updates.trust_level);
      }

      if (updates.tech_respect !== undefined) {
        setParts.push(`tech_respect = $${paramIndex++}`);
        values.push(updates.tech_respect);
      }

      if (updates.code_quality !== undefined) {
        setParts.push(`code_quality = $${paramIndex++}`);
        values.push(updates.code_quality);
      }

      if (updates.current_stack !== undefined) {
        setParts.push(`current_stack = $${paramIndex++}`);
        values.push(updates.current_stack);
      }

      if (updates.blocker !== undefined) {
        setParts.push(`blocker = $${paramIndex++}`);
        values.push(updates.blocker);
      }

      if (updates.student_type !== undefined) {
        setParts.push(`student_type = $${paramIndex++}`);
        values.push(updates.student_type);
      }

      if (setParts.length === 0) {
        return; // Nothing to update
      }

      setParts.push('message_count = message_count + 1');
      setParts.push('last_interaction = NOW()');

      await client.query(
        `UPDATE discord_bots.giorgi_profiles 
         SET ${setParts.join(', ')}
         WHERE discord_user_id = $1`,
        values
      );

      console.log(`✅ Updated Giorgi profile for ${discordUserId}:`, updates);
    } finally {
      client.release();
    }
  }

  /**
   * Update shared student profile fields (current_project, name, cohort, etc.)
   */
  async updateSharedStudentProfile(
    discordUserId: string,
    updates: {
      name?: string;
      cohort?: string;
      timezone?: string;
      current_project?: string;
      notes?: string;
      deadline_mvp?: string;
    }
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      const setParts: string[] = [];
      const values: any[] = [discordUserId];
      let paramIndex = 2;

      if (updates.name !== undefined) {
        setParts.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }

      if (updates.cohort !== undefined) {
        setParts.push(`cohort = $${paramIndex++}`);
        values.push(updates.cohort);
      }

      if (updates.timezone !== undefined) {
        setParts.push(`timezone = $${paramIndex++}`);
        values.push(updates.timezone);
      }

      if (updates.current_project !== undefined) {
        setParts.push(`current_project = $${paramIndex++}`);
        values.push(updates.current_project);
      }

      if (updates.notes !== undefined) {
        setParts.push(`notes = $${paramIndex++}`);
        values.push(updates.notes);
      }

      if (updates.deadline_mvp !== undefined) {
        setParts.push(`deadline_mvp = $${paramIndex++}`);
        values.push(updates.deadline_mvp);
      }

      if (setParts.length === 0) {
        return; // Nothing to update
      }

      setParts.push('last_seen_at = NOW()');

      await client.query(
        `UPDATE discord_bots.student_profiles 
         SET ${setParts.join(', ')}
         WHERE discord_user_id = $1`,
        values
      );

      console.log(`✅ Updated shared student profile for ${discordUserId}:`, updates);
    } finally {
      client.release();
    }
  }

  /**
   * Generic method to route updates to the correct agent profile
   */
  async updateStudentProfile(
    discordUserId: string,
    updates: any,
    botName: string = 'laura'
  ): Promise<void> {
    // Update shared fields if present (current_project, name, cohort, etc.)
    const sharedFields = ['name', 'cohort', 'timezone', 'current_project', 'notes', 'deadline_mvp'];
    const sharedUpdates: any = {};
    let hasSharedUpdates = false;

    for (const field of sharedFields) {
      if (updates[field] !== undefined) {
        sharedUpdates[field] = updates[field];
        hasSharedUpdates = true;
      }
    }

    if (hasSharedUpdates) {
      await this.updateSharedStudentProfile(discordUserId, sharedUpdates);
    }

    // Update agent-specific fields
    if (botName === 'laura') {
      await this.getOrCreateLauraProfile(discordUserId);
      await this.updateLauraProfile(discordUserId, updates);
    } else if (botName === 'giorgi') {
      await this.getOrCreateGiorgiProfile(discordUserId);
      await this.updateGiorgiProfile(discordUserId, updates);
    } else {
      console.warn(`⚠️ Unknown bot name: ${botName}`);
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.pool.end();
    console.log('📦 Database connection closed');
  }
}

