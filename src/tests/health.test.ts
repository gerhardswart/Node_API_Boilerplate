import request from 'supertest';
import app from '../app';

describe('Health Check Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Service is healthy');
      expect(response.body.data.status).toBeDefined();
      expect(response.body.data.uptime).toBeDefined();
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health status via API route', async () => {
      const response = await request(app).get('/api/v1/health').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.version).toBeDefined();
      expect(response.body.data.environment).toBeDefined();
    });
  });

  describe('GET /api/v1/health/detailed', () => {
    it('should return detailed health status with database check', async () => {
      const response = await request(app).get('/api/v1/health/detailed').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dependencies).toBeDefined();
      expect(response.body.data.dependencies.database).toBeDefined();
    });
  });
});
