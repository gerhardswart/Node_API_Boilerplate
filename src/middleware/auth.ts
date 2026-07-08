import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, unauthorizedResponse, errorResponse } from '../utils';
import type { IJwtPayload } from '../types';

/**
 * Authentication middleware
 * Validates JWT token from Authorization header
 */
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): Response | void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return unauthorizedResponse(res, 'No authorization token provided');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return unauthorizedResponse(
                res,
                'Invalid authorization header format. Use: Bearer <token>'
            );
        }

        const token = parts[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return unauthorizedResponse(res, 'Invalid or expired token');
        }

        req.user = decoded as IJwtPayload;
        next();
    } catch {
        return unauthorizedResponse(res, 'Authentication failed');
    }
};

/**
 * Role-based authorization middleware
 */
export const roleMiddleware = (...allowedRoles: string[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
        if (!req.user) {
            return unauthorizedResponse(res, 'User not authenticated');
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(res, 403, 'Insufficient permissions for this resource');
        }

        next();
    };
};

/**
 * Optional authentication middleware
 * Extracts user if token present but doesn't require it
 */
export const optionalAuthMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                const decoded = verifyToken(token);
                if (decoded) {
                    req.user = decoded as IJwtPayload;
                }
            }
        }
        next();
    } catch {
        next();
    }
};
