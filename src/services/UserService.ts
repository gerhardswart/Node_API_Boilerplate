import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyToken } from '../utils';
import { ConflictError, UnauthorizedError, NotFoundError, ValidationError } from '../middleware';
import config from '../config/index';
import logger from '../config/logger';
import type { IRegisterResult, ILoginResult, IRefreshTokenResult, IJwtPayload, IUserPublic, IValidationError } from '../types';

const userRepository = new UserRepository();

interface UpdateProfileData {
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface UpdateProfileResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  updatedAt: string;
}

/**
 * User service - business logic for user operations
 */
export class UserService {
  /**
   * Register a new user
   */
  async register(userData: { email: string; password: string; firstName?: string; lastName?: string }): Promise<IRegisterResult> {
    const { email, password, firstName, lastName } = userData;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(password);

    const newUser = await userRepository.create({
      email,
      password_hash: passwordHash,
      first_name: firstName || null,
      last_name: lastName || null,
      role: 'user',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const tokenPayload: IJwtPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = generateAccessToken(tokenPayload);

    const refreshToken = generateRefreshToken({ id: newUser.id });
    const refreshExpiresAt = new Date(Date.now() + this.parseTimeString(config.jwt.refreshExpiresIn));
    await userRepository.updateRefreshToken(newUser.id, refreshToken, refreshExpiresAt.toISOString());

    logger.info(`User registered: ${email}`, { userId: newUser.id });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        isActive: newUser.is_active,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate user and return tokens
   */
  async login(email: string, password: string): Promise<ILoginResult> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokenPayload: IJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);

    const refreshToken = generateRefreshToken({ id: user.id });
    const refreshExpiresAt = new Date(Date.now() + this.parseTimeString(config.jwt.refreshExpiresIn));
    await userRepository.updateRefreshToken(user.id, refreshToken, refreshExpiresAt.toISOString());

    await userRepository.updateLastLogin(user.id);

    logger.info(`User logged in: ${email}`, { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<IRefreshTokenResult> {
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenPayload: IJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);

    const newRefreshToken = generateRefreshToken({ id: user.id });
    const refreshExpiresAt = new Date(Date.now() + this.parseTimeString(config.jwt.refreshExpiresIn));
    await userRepository.updateRefreshToken(user.id, newRefreshToken, refreshExpiresAt.toISOString());

    logger.info(`Token refreshed for user: ${user.email}`, { userId: user.id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<boolean> {
    await userRepository.clearRefreshToken(userId);
    logger.info(`User logged out`, { userId });
    return true;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<IUserPublic> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: UpdateProfileData): Promise<UpdateProfileResult> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (updates.email && updates.email !== user.email) {
      const emailExists = await userRepository.emailExists(updates.email, userId);
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    const updateData: Partial<{ email: string; first_name: string | null; last_name: string | null }> = {};
    if (updates.email) {
      updateData.email = updates.email;
    }
    if (updates.firstName !== undefined) {
      updateData.first_name = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      updateData.last_name = updates.lastName;
    }

    const updatedUser = await userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundError('User not found after update');
    }

    logger.info(`Profile updated for user: ${userId}`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role,
      updatedAt: updatedUser.updated_at,
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new ValidationError([{ field: 'currentPassword', message: 'Current password is incorrect' } as IValidationError]);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, newPasswordHash);
    await userRepository.clearRefreshToken(userId);

    logger.info(`Password changed for user: ${userId}`);

    return true;
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: string): Promise<boolean> {
    await userRepository.update(userId, { is_active: false });
    await userRepository.clearRefreshToken(userId);
    logger.info(`Account deactivated: ${userId}`);
    return true;
  }

  /**
   * Parse time string like '1d', '7d' into milliseconds
   */
  parseTimeString(timeStr: string): number {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1), 10);

    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * units[unit];
  }
}

export default UserService;
