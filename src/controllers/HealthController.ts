import { Request, Response } from 'express';
import { successResponse } from '../utils';
import { getSupabaseClient } from '../config/database';
import packageJson from '../../package.json';

/**
 * Health check endpoint
 * GET /api/v1/health
 */
export const healthCheck = (_req: Request, res: Response): Response => {
  return successResponse(res, 200, 'Service is healthy', {
    status: 'healthy',
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

/**
 * Detailed health check with dependencies
 * GET /api/v1/health/detailed
 */
export const detailedHealthCheck = async (_req: Request, res: Response): Promise<Response> => {
  let dbStatus = 'healthy';

  try {
    const client = getSupabaseClient();
    const { error } = await client.from('users').select('id').limit(1);

    if (error) {
      dbStatus = `unhealthy: ${error.message}`;
    }
  } catch (error) {
    dbStatus = `unhealthy: ${(error as Error).message}`;
  }

  return successResponse(res, 200, 'Health check complete', {
    status: 'healthy',
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies: {
      database: dbStatus,
    },
  });
};
