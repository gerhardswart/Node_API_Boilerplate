import rateLimit from 'express-rate-limit';
import config from '../config/index';
import logger from '../config/logger';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: { success: boolean; message: string };
}

/**
 * General API rate limiter
 * Limits requests per window for all API routes
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      requestId: req.requestId,
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Create custom rate limiter
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs || 60000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
