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
}

export interface N8nResponse {
  response: string;
  metadata?: {
    tokens?: number;
    processingTime?: number;
  };
}

export class N8nService {
  private webhookUrl: string;
  private authHeader?: string;
  private timeout: number;

  constructor() {
    this.webhookUrl = config.n8n.webhookUrl;
    this.authHeader = config.n8n.authHeader;
    this.timeout = config.agent.responseTimeout;
  }

  /**
   * Send a message to n8n webhook and get agent response
   */
  async sendToAgent(
    channelId: string,
    userId: string,
    username: string,
    message: string,
    conversationHistory: Message[]
  ): Promise<string> {
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
      };

      console.log(`📤 Sending to n8n (${config.agent.name}):`, {
        user: username,
        messageLength: message.length,
        contextMessages: conversationContext.length,
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

      console.log(`📥 Received from n8n:`, {
        responseLength: response.data.response?.length || 0,
        metadata: response.data.metadata,
      });

      // Extract response text
      const agentResponse = response.data.response;

      if (!agentResponse) {
        throw new Error('n8n response missing "response" field');
      }

      return agentResponse;
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

