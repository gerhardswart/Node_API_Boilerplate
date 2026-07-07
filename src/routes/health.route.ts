import express from 'express';
import { healthCheck, detailedHealthCheck } from '../controllers/HealthController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check endpoints
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 */
router.get('/', healthCheck);

/**
 * @swagger
 * /api/v1/health/detailed:
 *   get:
 *     summary: Detailed health check
 *     tags: [Health]
 */
router.get('/detailed', detailedHealthCheck);

export default router;
