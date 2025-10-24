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
    channelName: string | null = null
  ): Promise<Conversation> {
    const client = await this.pool.connect();
    try {
      // Try to get existing conversation
      const existingResult = await client.query<Conversation>(
        'SELECT * FROM discord_bots.conversations WHERE channel_id = $1',
        [channelId]
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
         (channel_id, channel_type, guild_id, channel_name) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [channelId, channelType, guildId, channelName]
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
    agentName: string | null = null
  ): Promise<Message> {
    const result = await this.pool.query<Message>(
      `INSERT INTO discord_bots.messages 
       (conversation_id, discord_message_id, sender_id, sender_type, content, agent_name) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [conversationId, discordMessageId, senderId, senderType, content, agentName]
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
   * Update student profile with data from Laura
   */
  async updateStudentProfile(
    discordUserId: string,
    updates: {
      tension_level?: number;
      trust_level?: number;
      notes?: string;
      current_project?: string;
      name?: string;
      cohort?: string;
      timezone?: string;
      deadline_mvp?: string;
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

      if (updates.notes !== undefined) {
        setParts.push(`notes = $${paramIndex++}`);
        values.push(updates.notes);
      }

      if (updates.current_project !== undefined) {
        setParts.push(`current_project = $${paramIndex++}`);
        values.push(updates.current_project);
      }

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

      if (updates.deadline_mvp !== undefined) {
        setParts.push(`deadline_mvp = $${paramIndex++}`);
        values.push(updates.deadline_mvp);
      }

      if (setParts.length === 0) {
        return; // Nothing to update
      }

      await client.query(
        `UPDATE discord_bots.student_profiles 
         SET ${setParts.join(', ')}, last_seen_at = NOW()
         WHERE discord_user_id = $1`,
        values
      );

      console.log(`✅ Updated student profile for ${discordUserId}:`, updates);
    } finally {
      client.release();
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

