import type { IUser, IUserPublic } from '../types';

/**
 * User model class
 * Represents the database schema and operations for users
 */
export class User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string | null;
    last_name: string | null;
    role: 'user' | 'admin';
    is_active: boolean;
    refresh_token: string | null;
    refresh_token_expires_at: string | null;
    created_at: string;
    updated_at: string;

    constructor(data: Partial<IUser> = {}) {
        this.id = data.id || '';
        this.email = data.email || '';
        this.password_hash = data.password_hash || '';
        this.first_name = data.first_name || null;
        this.last_name = data.last_name || null;
        this.role = data.role || 'user';
        this.is_active = data.is_active ?? true;
        this.refresh_token = data.refresh_token || null;
        this.refresh_token_expires_at = data.refresh_token_expires_at || null;
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
    }

    toJSON(): IUserPublic {
        return {
            id: this.id,
            email: this.email,
            firstName: this.first_name,
            lastName: this.last_name,
            role: this.role,
            isActive: this.is_active,
            createdAt: this.created_at,
            updatedAt: this.updated_at,
        };
    }
}

export default User;
