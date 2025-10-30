import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { Message } from './database.service';

export interface N8nRequest {
  sessionId: string;
  channelId: string;
  userId: string;
  username: string;
  message: string;
  conversationContext: {
    sender: string;
    content: string;
    timestamp: string;
  }[];
  studentProfile?: any; // Agent-specific profile data
}

export interface N8nResponse {
  // Sync pattern: n8n responds immediately with the answer
  response?: string;
  profile_updates?: {
    tension_level?: number;
    trust_level?: number;
    notes?: string;
    current_project?: string;
    name?: string;
    cohort?: string;
    timezone?: string;
    deadline_mvp?: string;
  };
  metadata?: {
    tokens?: number;
    processingTime?: number;
  };
  
  // Async pattern: n8n acknowledges and will callback later
  acknowledged?: boolean;
  status?: string;
}

export class N8nService {
  private webhookUrl: string;
  private authHeader?: string;
  private timeout: number;

  constructor(webhookUrl: string, timeout: number) {
    this.webhookUrl = webhookUrl;
    this.authHeader = config.n8n.authHeader;
    this.timeout = timeout;
  }

  /**
   * Send a message to n8n webhook
   * Supports BOTH sync and async patterns - n8n decides which to use
   * 
   * Sync: n8n responds with {"response": "...", "profile_updates": {...}}
   * Async: n8n responds with {"acknowledged": true, "status": "processing"}
   *        (then sends callback to /webhook/agent-response later)
   */
  async sendToAgent(
    channelId: string,
    userId: string,
    username: string,
    message: string,
    conversationHistory: Message[],
    studentProfile?: any
  ): Promise<N8nResponse> {
    try {
      // Build conversation context from history
      const conversationContext = conversationHistory
        .filter((msg) => msg && msg.createdAt) // Filter out invalid messages
        .map((msg) => ({
          sender: msg.senderType === 'student' ? 'user' : msg.agentName || 'agent',
          content: msg.content,
          timestamp: msg.createdAt.toISOString(),
        }));

      // Prepare request payload
      const payload: N8nRequest = {
        sessionId: channelId, // Use channelId as session ID for conversation tracking
        channelId,
        userId,
        username,
        message,
        conversationContext,
        studentProfile, // Include agent-specific profile
      };

      console.log(`📤 Sending to n8n:`, {
        user: username,
        messageLength: message.length,
        contextMessages: conversationContext.length,
        hasProfile: !!studentProfile,
      });

      // Send to n8n webhook
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authHeader) {
        headers['Authorization'] = this.authHeader;
      }

      const response = await axios.post<N8nResponse>(
        this.webhookUrl,
        payload,
        {
          headers,
          timeout: this.timeout,
        }
      );

      // Check which pattern n8n used
      if (response.data.acknowledged) {
        // Async pattern: n8n acknowledged, will send callback later
        console.log(`📥 Received acknowledgment from n8n:`, {
          status: response.data.status || 'processing',
          pattern: 'async'
        });
        
        return {
          acknowledged: true,
          status: response.data.status || 'processing',
        };
      } else if (response.data.response) {
        // Sync pattern: n8n responded immediately
        console.log(`📥 Received response from n8n:`, {
          responseLength: response.data.response.length,
          hasProfileUpdates: !!response.data.profile_updates,
          metadata: response.data.metadata,
          pattern: 'sync'
        });

        return {
          response: response.data.response,
          profile_updates: response.data.profile_updates,
          metadata: response.data.metadata,
        };
      } else {
        // Invalid response - neither sync nor async
        throw new Error('n8n response missing both "response" and "acknowledged" fields');
      }
    } catch (error) {
      console.error('❌ n8n webhook error:', error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Response status:', axiosError.response.status);
          console.error('Response data:', axiosError.response.data);
        } else if (axiosError.code === 'ECONNABORTED') {
          throw new Error(`Agent response timeout (${this.timeout}ms)`);
        }
      }

      throw new Error(`Failed to get agent response: ${error}`);
    }
  }

  /**
   * Test n8n webhook connection
   */
  async testWebhook(): Promise<boolean> {
    try {
      const testPayload: N8nRequest = {
        sessionId: 'test-session',
        channelId: 'test',
        userId: 'test-user',
        username: 'Test User',
        message: 'Hello! This is a test message.',
        conversationContext: [],
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authHeader) {
        headers['Authorization'] = this.authHeader;
      }

      const response = await axios.post(this.webhookUrl, testPayload, {
        headers,
        timeout: 5000,
      });

      console.log('✅ n8n webhook test successful:', response.status);
      return true;
    } catch (error) {
      console.error('❌ n8n webhook test failed:', error);
      return false;
    }
  }
}

