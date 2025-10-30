import dotenv from 'dotenv';
import { GatewayIntentBits, Partials } from 'discord.js';

// Load environment variables
dotenv.config();

export interface SingleBotConfig {
  name: string;
  token: string;
  n8nWebhookUrl: string;
  clientId?: string;
  maxContextMessages: number;
  responseTimeout: number;
  profileFields: string[];
}

export interface AppConfig {
  bots: SingleBotConfig[];
  database: {
    url: string;
  };
  discord: {
    intents: GatewayIntentBits[];
    partials: Partials[];
  };
  n8n: {
    authHeader?: string;
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

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// Parse bot configurations from environment
function parseBotsConfig(): SingleBotConfig[] {
  const bots: SingleBotConfig[] = [];

  // Laura (required - backward compatibility)
  if (process.env.DISCORD_BOT_TOKEN || process.env.LAURA_BOT_TOKEN) {
    bots.push({
      name: 'laura',
      token: process.env.LAURA_BOT_TOKEN || getEnvOrThrow('DISCORD_BOT_TOKEN'),
      n8nWebhookUrl: process.env.LAURA_N8N_WEBHOOK_URL || getEnvOrThrow('N8N_WEBHOOK_URL'),
      clientId: process.env.LAURA_CLIENT_ID,
      maxContextMessages: parseInt(getEnvOrDefault('LAURA_MAX_CONTEXT_MESSAGES', '10'), 10),
      responseTimeout: parseInt(getEnvOrDefault('LAURA_RESPONSE_TIMEOUT', '600000'), 10), // 10 minutes
      profileFields: ['tension_level', 'trust_level', 'current_project', 'deadline_mvp', 'notes', 'cohort', 'timezone'],
    });
  }

  // Giorgi (optional)
  if (process.env.GIORGI_BOT_TOKEN) {
    bots.push({
      name: 'giorgi',
      token: getEnvOrThrow('GIORGI_BOT_TOKEN'),
      n8nWebhookUrl: getEnvOrThrow('GIORGI_N8N_WEBHOOK_URL'),
      clientId: process.env.GIORGI_CLIENT_ID,
      maxContextMessages: parseInt(getEnvOrDefault('GIORGI_MAX_CONTEXT_MESSAGES', '10'), 10),
      responseTimeout: parseInt(getEnvOrDefault('GIORGI_RESPONSE_TIMEOUT', '600000'), 10), // 10 minutes
      profileFields: ['tech_respect', 'code_quality', 'current_stack', 'blocker', 'notes', 'student_type'],
    });
  }

  // Nino (optional - add when ready)
  if (process.env.NINO_BOT_TOKEN) {
    bots.push({
      name: 'nino',
      token: getEnvOrThrow('NINO_BOT_TOKEN'),
      n8nWebhookUrl: getEnvOrThrow('NINO_N8N_WEBHOOK_URL'),
      clientId: process.env.NINO_CLIENT_ID,
      maxContextMessages: parseInt(getEnvOrDefault('NINO_MAX_CONTEXT_MESSAGES', '10'), 10),
      responseTimeout: parseInt(getEnvOrDefault('NINO_RESPONSE_TIMEOUT', '600000'), 10), // 10 minutes
      profileFields: ['design_taste', 'ux_understanding', 'current_mockup', 'feedback_notes'],
    });
  }

  if (bots.length === 0) {
    throw new Error('No bots configured! At least one bot token is required.');
  }

  return bots;
}

export const config: AppConfig = {
  bots: parseBotsConfig(),
  database: {
    url: getEnvOrThrow('DATABASE_URL'),
  },
  discord: {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
  },
  n8n: {
    authHeader: process.env.N8N_WEBHOOK_AUTH_HEADER,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    debug: process.env.DEBUG === 'true',
  },
};

