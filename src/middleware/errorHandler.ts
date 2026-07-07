import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { errorResponse } from '../utils';
import type { IValidationError } from '../types';

/**
 * Custom application error class
 */
export class AppError extends Error {
  statusCode: number;
  errors: IValidationError[];
  isOperational: boolean;

  constructor(message: string, statusCode: number, errors: IValidationError[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found error class
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(errors: IValidationError[], message = 'Validation failed') {
    super(message, 400, errors);
  }
}

/**
 * Unauthorized error class
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

/**
 * Forbidden error class
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

interface ErrorWithStatus extends Error {
  statusCode?: number;
  errors?: IValidationError[];
  isOperational?: boolean;
  status?: number;
}

/**
 * Centralized error handling middleware
 */
export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'SyntaxError' && 'status' in err && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON body';
  }

  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`${err.message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    requestId: req.requestId,
    stack: statusCode >= 500 ? err.stack : undefined,
  });

  if (statusCode >= 500 && !err.isOperational) {
    message = 'Internal server error';
    errors = [];
  }

  return errorResponse(res, statusCode, message, errors);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    requestId: req.requestId,
  });

  return errorResponse(res, 404, `Route ${req.method} ${req.path} not found`);
};
