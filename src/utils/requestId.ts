import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID middleware
 * Adds a unique identifier to each request for tracing
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};
