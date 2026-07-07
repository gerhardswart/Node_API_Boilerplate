import { RequestHandler, Request, Response } from 'express';
import { successResponse, createdResponse, asyncHandler } from '../utils';
import { validate } from '../middleware';
import { registerValidation, loginValidation, refreshTokenValidation, updateProfileValidation, changePasswordValidation } from '../validators';
import UserService from '../services/UserService';
import type { IJwtPayload } from '../types';

const userService = new UserService();

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register: RequestHandler[] = [
  ...registerValidation,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return createdResponse(res, 'User registered successfully', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }),
];

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login: RequestHandler[] = [
  ...loginValidation,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await userService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, 200, 'Login successful', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }),
];

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken: RequestHandler[] = [
  ...refreshTokenValidation,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await userService.refreshToken(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 200, 'Token refreshed successfully', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }),
];

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
export const getProfile: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    const profile = await userService.getProfile(user.id);
    return successResponse(res, 200, 'Profile retrieved successfully', { user: profile });
  }),
];

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
export const updateProfile: RequestHandler[] = [
  ...updateProfileValidation,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    const updatedUser = await userService.updateProfile(user.id, req.body);
    return successResponse(res, 200, 'Profile updated successfully', { user: updatedUser });
  }),
];

/**
 * Change password
 * PUT /api/v1/auth/change-password
 */
export const changePassword: RequestHandler[] = [
  ...changePasswordValidation,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    await userService.changePassword(user.id, req.body.currentPassword, req.body.newPassword);
    return successResponse(res, 200, 'Password changed successfully. Please login again.');
  }),
];

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    await userService.logout(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return successResponse(res, 200, 'Logged out successfully');
  }),
];

/**
 * Deactivate account
 * DELETE /api/v1/auth/account
 */
export const deactivateAccount: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IJwtPayload;
    await userService.deactivateAccount(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return successResponse(res, 200, 'Account deactivated successfully');
  }),
];
