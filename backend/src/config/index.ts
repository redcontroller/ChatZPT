import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  // Server
  NODE_ENV: string;
  PORT: number;
  
  // JWT
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // Password Hashing
  BCRYPT_ROUNDS: number;
  
  // OpenAI
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_MAX_TOKENS?: number;
  OPENAI_TEMPERATURE?: number;
  OPENAI_TOP_P?: number;
  OPENAI_FREQUENCY_PENALTY?: number;
  OPENAI_PRESENCE_PENALTY?: number;
  OPENAI_MAX_CONTEXT_MESSAGES?: number;
  OPENAI_MAX_MESSAGE_LENGTH?: number;
  
  // Email Service
  EMAIL_SERVICE_API_KEY?: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Logging
  LOG_LEVEL: string;
  
  // Database
  DB_PATH: string;
  
  // CORS
  CORS_ORIGIN: string;
}

const config: Config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Password Hashing
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || (process.env.NODE_ENV === 'production' ? 'gpt-4o-mini-search-preview' : 'gpt-3.5-turbo-16k'),
  OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS || '1500', 10),
  OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  OPENAI_TOP_P: parseFloat(process.env.OPENAI_TOP_P || '0.9'),
  OPENAI_FREQUENCY_PENALTY: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '0.1'),
  OPENAI_PRESENCE_PENALTY: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '0.1'),
  OPENAI_MAX_CONTEXT_MESSAGES: parseInt(process.env.OPENAI_MAX_CONTEXT_MESSAGES || '8', 10),
  OPENAI_MAX_MESSAGE_LENGTH: parseInt(process.env.OPENAI_MAX_MESSAGE_LENGTH || '500', 10),
  
  // Email Service
  EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Database
  DB_PATH: process.env.DB_PATH || './data/db.json',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Validation
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Validate JWT secrets are strong enough
if (config.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

if (config.JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
}

// Validate port number
if (config.PORT < 1 || config.PORT > 65535) {
  throw new Error('PORT must be between 1 and 65535');
}

// Validate bcrypt rounds
if (config.BCRYPT_ROUNDS < 10 || config.BCRYPT_ROUNDS > 15) {
  throw new Error('BCRYPT_ROUNDS must be between 10 and 15');
}

export default config;
