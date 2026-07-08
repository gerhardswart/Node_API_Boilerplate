import jwt from 'jsonwebtoken';
import config from '../config/index';
import type { IJwtPayload } from '../types';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: IJwtPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: { id: string }): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): IJwtPayload | null => {
    try {
        return jwt.verify(token, config.jwt.secret) as IJwtPayload;
    } catch {
        return null;
    }
};

/**
 * Decode token without verification (for inspection only)
 */
export const decodeToken = (token: string): IJwtPayload | null => {
    try {
        return jwt.decode(token) as IJwtPayload | null;
    } catch {
        return null;
    }
};
