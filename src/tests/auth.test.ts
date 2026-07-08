import request from 'supertest';
import app from '../app';
import { getDatabaseClient, type IDatabaseClient } from '../config/database';
import { generateAccessToken } from '../utils';
import type { IUser } from '../types';

declare global {
    function createTestUser(userData?: {
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        role?: 'user' | 'admin';
        isActive?: boolean;
    }): Promise<IUser>;
}

let db: IDatabaseClient;

describe('Authentication Tests', () => {
    beforeAll(() => {
        db = getDatabaseClient();
    });

    afterAll(async () => {
        // Cleanup is handled in setup.ts
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: `register-test-${Date.now()}@example.com`,
                password: 'Password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.firstName).toBe('John');
            expect(response.body.data.user.lastName).toBe('Doe');
            expect(response.body.data.user.password).toBeUndefined();
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();

            // Cleanup
            await db.delete('users', response.body.data.user.id);
        });

        it('should return validation error for invalid email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Password123',
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
            expect(response.body.errors).toBeDefined();
            expect(response.body.errors.some((e: { field: string }) => e.field === 'email')).toBe(
                true
            );
        });

        it('should return validation error for weak password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'weak@test.com',
                    password: 'weak',
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should return validation error for missing required fields', async () => {
            const response = await request(app).post('/api/v1/auth/register').send({}).expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
            expect(response.body.errors.length).toBeGreaterThan(0);
        });

        it('should return conflict error for duplicate email', async () => {
            const email = `duplicate-${Date.now()}@example.com`;

            // Create user first
            await global.createTestUser({ email });

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email,
                    password: 'Password123',
                })
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email already registered');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        let testUser: IUser;

        beforeAll(async () => {
            testUser = await global.createTestUser({
                email: `login-test-${Date.now()}@example.com`,
                password: 'Password123',
            });
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'Password123',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.user.email).toBe(testUser.email);
        });

        it('should return unauthorized for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should return unauthorized for non-existent user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return validation error for missing fields', async () => {
            const response = await request(app).post('/api/v1/auth/login').send({}).expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('GET /api/v1/auth/profile', () => {
        let testUser: IUser;
        let accessToken: string;

        beforeAll(async () => {
            testUser = await global.createTestUser({
                email: `profile-test-${Date.now()}@example.com`,
                password: 'Password123',
            });

            // Generate token for authentication
            accessToken = generateAccessToken({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            });
        });

        it('should return user profile for authenticated user', async () => {
            const response = await request(app)
                .get('/api/v1/auth/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe(testUser.email);
        });

        it('should return unauthorized for missing token', async () => {
            const response = await request(app).get('/api/v1/auth/profile').expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No authorization token provided');
        });

        it('should return unauthorized for invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/v1/auth/profile', () => {
        let testUser: IUser;
        let accessToken: string;

        beforeAll(async () => {
            testUser = await global.createTestUser({
                email: `update-test-${Date.now()}@example.com`,
                password: 'Password123',
            });

            accessToken = generateAccessToken({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            });
        });

        it('should update profile successfully', async () => {
            const response = await request(app)
                .put('/api/v1/auth/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    firstName: 'Updated',
                    lastName: 'Name',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.firstName).toBe('Updated');
            expect(response.body.data.user.lastName).toBe('Name');
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        let testUser: IUser;
        let accessToken: string;

        beforeAll(async () => {
            testUser = await global.createTestUser({
                email: `logout-test-${Date.now()}@example.com`,
                password: 'Password123',
            });

            accessToken = generateAccessToken({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            });
        });

        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Logged out successfully');
        });
    });
});
