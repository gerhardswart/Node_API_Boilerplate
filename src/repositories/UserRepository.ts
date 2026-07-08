import BaseRepository from './BaseRepository';
import type { IDatabaseClient } from '../config/database';
import { getDatabaseClient } from '../config/database';
import type { IUser } from '../types';

/**
 * User repository with user-specific operations
 */
export class UserRepository extends BaseRepository<IUser> {
  constructor(getClient: () => IDatabaseClient = getDatabaseClient) {
    super('users', getClient);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return this.findBy('email', email);
  }

  /**
   * Create a new user with hashed password
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const existingUser = await this.findByEmail(userData.email!);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    return super.create(userData);
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: string): Promise<boolean> {
    const result = await this.update(userId, {
      refresh_token: refreshToken,
      refresh_token_expires_at: expiresAt,
    } as Partial<IUser>);
    return result !== null;
  }

  /**
   * Clear refresh token (logout)
   */
  async clearRefreshToken(userId: string): Promise<boolean> {
    const result = await this.update(userId, {
      refresh_token: null,
      refresh_token_expires_at: null,
    } as Partial<IUser>);
    return result !== null;
  }

  /**
   * Find by valid refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    const client = this.getClient();
    const users = await client.findMany<IUser>(this.tableName, { refresh_token: refreshToken });

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    if (!user.refresh_token_expires_at) {
      return null;
    }

    const expiresAt = new Date(user.refresh_token_expires_at);
    if (expiresAt < new Date()) {
      return null;
    }

    return user;
  }

  /**
   * Update password
   */
  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    const result = await this.update(userId, {
      password_hash: passwordHash,
    } as Partial<IUser>);
    return result !== null;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<boolean> {
    const result = await this.update(userId, {
      last_login_at: new Date().toISOString(),
    } as Partial<IUser>);
    return result !== null;
  }

  /**
   * Check if email exists (for validation)
   */
  async emailExists(email: string, excludeId: string | null = null): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) return false;
    if (excludeId && user.id === excludeId) return false;
    return true;
  }
}

export default UserRepository;
