// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '4'; // Lower rounds for faster tests

import { getDatabaseClient, resetDatabase, type IDatabaseClient } from '../config/database';
import logger from '../config/logger';
import { hashPassword } from '../utils';
import type { IUser } from '../types';

// Suppress logger in tests unless needed
logger.transports.forEach((t) => (t.silent = true));

let db: IDatabaseClient | null = null;
const testUserIds: string[] = [];

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
    if (!db) {
        return;
    }

    try {
        for (const userId of testUserIds) {
            await db.delete('users', userId);
        }
        testUserIds.length = 0;
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

export async function createTestUser(userData: TestUserData = {}): Promise<IUser> {
    if (!db) {
        db = getDatabaseClient();
    }

    const passwordHash = await hashPassword(userData.password || 'Password123');
    const email = userData.email || `test-${Date.now()}@example.com`;

    const user = await db.create<IUser>('users', {
        email,
        password_hash: passwordHash,
        first_name: userData.firstName || 'Test',
        last_name: userData.lastName || 'User',
        role: userData.role || 'user',
        is_active: userData.isActive ?? true,
    });

    testUserIds.push(user.id);
    return user;
}

// Declare global functions for tests
declare global {
    function cleanupTestData(): Promise<void>;
    function createTestUser(userData?: TestUserData): Promise<IUser>;
}

// Make functions available globally
(global as { cleanupTestData?: () => Promise<void> }).cleanupTestData = cleanupTestData;
(global as { createTestUser?: (userData?: TestUserData) => Promise<IUser> }).createTestUser =
    createTestUser;

// Reset database before each test suite
beforeAll(() => {
    resetDatabase();
    db = getDatabaseClient();
});

// Cleanup after all tests
afterAll(async () => {
    await cleanupTestData();
    resetDatabase();
});
