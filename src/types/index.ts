export interface IUser {
    id: string;
    email: string;
    password_hash: string;
    first_name: string | null;
    last_name: string | null;
    role: 'user' | 'admin';
    is_active: boolean;
    refresh_token: string | null;
    refresh_token_expires_at: string | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface IUserPublic {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: 'user' | 'admin';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface IRegisterData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface ILoginResult extends IAuthTokens {
    user: IUserPublic;
}

export interface IRegisterResult extends ILoginResult {
    user: IUserPublic & { createdAt: string };
}

export interface IRefreshTokenResult extends IAuthTokens {}

export interface IJwtPayload {
    id: string;
    email: string;
    role: 'user' | 'admin';
    iat?: number;
    exp?: number;
}

export interface IValidationError {
    field: string;
    message: string;
}

export interface IApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: IValidationError[];
}

export interface IPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface IPaginatedResult<T> {
    data: T[];
    pagination: IPagination;
}

export interface IRequestUser extends IJwtPayload {
    requestId?: string;
}

export interface IConfig {
    port: number;
    nodeEnv: string;
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    bcrypt: {
        rounds: number;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    database: {
        type: 'postgres' | 'mysql' | 'mongodb' | 'memory';
        url?: string;
    };
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
}
