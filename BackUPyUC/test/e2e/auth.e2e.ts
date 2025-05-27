import request from 'supertest';
import { testApp } from './setup';
import { UserService } from '../../src/core/services/user.service';
import { clearDatabase } from '../utils/database';

describe('Auth E2E Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(testApp)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
          name: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Crear usuario para pruebas
      await request(testApp)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
          name: 'Test User'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(testApp)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(testApp)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong'
        });

      expect(response.status).toBe(401);
    });
  });
}); 