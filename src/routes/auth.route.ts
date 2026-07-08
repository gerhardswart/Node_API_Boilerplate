import express from 'express';
import { authMiddleware, authLimiter } from '../middleware';
import {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    deactivateAccount,
} from '../controllers/AuthController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 */
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 */
router.post('/logout', authMiddleware, logout);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 */
router.put('/profile', authMiddleware, updateProfile);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     summary: Change password
 *     tags: [Authentication]
 */
router.put('/change-password', authMiddleware, changePassword);

/**
 * @swagger
 * /api/v1/auth/account:
 *   delete:
 *     summary: Deactivate account
 *     tags: [Authentication]
 */
router.delete('/account', authMiddleware, deactivateAccount);

export default router;
