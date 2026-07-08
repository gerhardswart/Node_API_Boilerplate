import { Response } from 'express';
import type { IApiResponse, IValidationError } from '../types';

export const sendResponse = <T = unknown>(
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data: T | null = null,
    errors: IValidationError[] = []
): Response => {
    const response: IApiResponse<T> = {
        success,
        message,
    };

    if (data !== null) {
        response.data = data;
    }

    if (errors.length > 0) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

export const successResponse = <T = unknown>(
    res: Response,
    statusCode = 200,
    message = 'Operation successful',
    data: T | null = null
): Response => {
    return sendResponse(res, statusCode, true, message, data);
};

export const errorResponse = (
    res: Response,
    statusCode = 500,
    message = 'An error occurred',
    errors: IValidationError[] = []
): Response => {
    return sendResponse(res, statusCode, false, message, null, errors);
};

export const createdResponse = <T = unknown>(
    res: Response,
    message = 'Resource created successfully',
    data: T | null = null
): Response => {
    return successResponse(res, 201, message, data);
};

export const notFoundResponse = (res: Response, message = 'Resource not found'): Response => {
    return errorResponse(res, 404, message);
};

export const unauthorizedResponse = (res: Response, message = 'Unauthorized access'): Response => {
    return errorResponse(res, 401, message);
};

export const forbiddenResponse = (res: Response, message = 'Access forbidden'): Response => {
    return errorResponse(res, 403, message);
};

export const validationErrorResponse = (
    res: Response,
    errors: IValidationError[],
    message = 'Validation failed'
): Response => {
    return errorResponse(res, 400, message, errors);
};
