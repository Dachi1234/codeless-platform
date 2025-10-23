import dotenv from 'dotenv';
import { GatewayIntentBits, Partials } from 'discord.js';

// Load environment variables
dotenv.config();

export interface BotConfig {
  discord: {
    token: string;
    applicationId?: string;
    intents: GatewayIntentBits[];
    partials: Partials[];
  };
  database: {
    url: string;
  };
  n8n: {
    webhookUrl: string;
    authHeader?: string;
  };
  agent: {
    name: string;
    maxContextMessages: number;
    responseTimeout: number;
  };
  logging: {
    level: string;
    debug: boolean;
  };
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config: BotConfig = {
  discord: {
    token: getEnvOrThrow('DISCORD_BOT_TOKEN'),
    applicationId: process.env.DISCORD_APPLICATION_ID,
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
  },
  database: {
    url: getEnvOrThrow('DATABASE_URL'),
  },
  n8n: {
    webhookUrl: getEnvOrThrow('N8N_WEBHOOK_URL'),
    authHeader: process.env.N8N_WEBHOOK_AUTH_HEADER,
  },
  agent: {
    name: process.env.AGENT_NAME || 'laura',
    maxContextMessages: parseInt(process.env.MAX_CONTEXT_MESSAGES || '10', 10),
    responseTimeout: parseInt(process.env.AGENT_RESPONSE_TIMEOUT || '30000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    debug: process.env.DEBUG === 'true',
  },
};

