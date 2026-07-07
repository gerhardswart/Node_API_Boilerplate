import dotenv from 'dotenv';
import type { IConfig } from '../types';

dotenv.config();

const config: IConfig = {
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10) || 10,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10) || 100,
  },
  supabase: {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

export default config;
