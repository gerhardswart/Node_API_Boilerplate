import request from 'supertest';
import app from '../app';

describe('Error Handling Tests', () => {
  describe('404 Route Not Found', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/api/v1/nonexistent').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 for invalid HTTP methods', async () => {
      const response = await request(app).patch('/api/v1/auth/register').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Validation Errors', () => {
    it('should return formatted validation errors', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);

      response.body.errors.forEach((error: { field: string; message: string }) => {
        expect(error.field).toBeDefined();
        expect(error.message).toBeDefined();
      });
    });
  });

  describe('JSON Body Parsing', () => {
    it('should handle invalid JSON body', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Response Format', () => {
    it('should return consistent error response format', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({}).expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.message).toBe('string');
    });
  });
});
