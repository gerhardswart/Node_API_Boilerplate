import express from 'express';
import authRoutes from './auth.route';
import healthRoutes from './health.route';

const router = express.Router();

/**
 * API v1 routes
 */
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

export default router;
