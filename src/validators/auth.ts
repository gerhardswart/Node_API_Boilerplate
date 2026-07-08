import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Password strength validation regex
 * Requires: 8+ chars, 1 uppercase, 1 lowercase, 1 number
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const validateUuid = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
};

/**
 * User registration validation rules
 */
export const registerValidation: ValidationChain[] = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(passwordRegex)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),

    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('First name must be less than 100 characters'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Last name must be less than 100 characters'),
];

/**
 * User login validation rules
 */
export const loginValidation: ValidationChain[] = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Refresh token validation rules
 */
export const refreshTokenValidation: ValidationChain[] = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

/**
 * Update profile validation rules
 */
export const updateProfileValidation: ValidationChain[] = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('First name must be less than 100 characters'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Last name must be less than 100 characters'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
];

/**
 * UUID parameter validation
 */
export const uuidParamValidation = (paramName: string): ValidationChain[] => [
    param(paramName).custom((value: string) => {
        if (!validateUuid(value)) {
            throw new Error(`Invalid ${paramName} format`);
        }
        return true;
    }),
];

/**
 * Pagination query validation
 */
export const paginationValidation: ValidationChain[] = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),
    query('sort').optional().trim().isLength({ max: 50 }).withMessage('Sort parameter too long'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
];

/**
 * Change password validation rules
 */
export const changePasswordValidation: ValidationChain[] = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(passwordRegex)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .custom((value: string, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        }),
];
