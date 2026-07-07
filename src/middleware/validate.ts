import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils';

/**
 * Validation middleware
 * Checks express-validator results and returns errors if any
 */
export const validate = (req: Request, res: Response, next: NextFunction): Response | void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: (error as { path: string }).path,
      message: error.msg,
    }));

    return validationErrorResponse(res, formattedErrors, 'Validation failed');
  }

  next();
};
