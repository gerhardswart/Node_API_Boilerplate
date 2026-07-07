import BaseRepository from './BaseRepository';
import type { IUser } from '../types';

/**
 * User repository with user-specific operations
 */
export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const client = this.getClient();
    const { data, error } = await client.from('users').select('*').eq('email', email).maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as IUser | null;
  }

  /**
   * Create a new user with hashed password
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const client = this.getClient();
    const { data, error } = await client.from('users').insert(userData).select().single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return data as IUser;
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client
      .from('users')
      .update({
        refresh_token: refreshToken,
        refresh_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  /**
   * Clear refresh token (logout)
   */
  async clearRefreshToken(userId: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client
      .from('users')
      .update({
        refresh_token: null,
        refresh_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  /**
   * Find by valid refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('refresh_token', refreshToken)
      .gt('refresh_token_expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as IUser | null;
  }

  /**
   * Update password
   */
  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }

  /**
   * Check if email exists (for validation)
   */
  async emailExists(email: string, excludeId: string | null = null): Promise<boolean> {
    const client = this.getClient();
    let query = client.from('users').select('id').eq('email', email);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data !== null;
  }
}

export default UserRepository;
