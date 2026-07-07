// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '4'; // Lower rounds for faster tests

// Ensure Supabase variables are set
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}
if (!process.env.SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
}

import { getSupabaseClient } from '../config/database';
import logger from '../config/logger';
import { hashPassword } from '../utils';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IUser } from '../types';

// Suppress logger in tests unless needed
logger.transports.forEach((t) => (t.silent = true));

let supabase: SupabaseClient | null = null;
const testUsers: string[] = [];

interface TestUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  [key: string]: unknown;
}

export async function cleanupTestData(): Promise<void> {
  if (!supabase) {
    return;
  }

  try {
    for (const userId of testUsers) {
      await supabase.from('users').delete().eq('id', userId);
    }
    testUsers.length = 0;
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

export async function createTestUser(userData: TestUserData = {}): Promise<IUser> {
  if (!supabase) {
    supabase = getSupabaseClient();
  }

  const passwordHash = await hashPassword(userData.password || 'Password123');

  const user: Record<string, unknown> = {
    email: userData.email || `test-${Date.now()}@example.com`,
    password_hash: passwordHash,
    first_name: userData.firstName || 'Test',
    last_name: userData.lastName || 'User',
    role: userData.role || 'user',
    is_active: userData.isActive ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...userData,
  };

  delete user.password;

  const { data, error } = await supabase.from('users').insert(user).select().single();

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  testUsers.push(data.id);
  return data as IUser;
}

// Declare global functions for tests
declare global {
  function cleanupTestData(): Promise<void>;
  function createTestUser(userData?: TestUserData): Promise<IUser>;
}

// Make functions available globally
(global as { cleanupTestData?: () => Promise<void> }).cleanupTestData = cleanupTestData;
(global as { createTestUser?: (userData?: TestUserData) => Promise<IUser> }).createTestUser = createTestUser;

// Cleanup after all tests
afterAll(async () => {
  await cleanupTestData();
});
