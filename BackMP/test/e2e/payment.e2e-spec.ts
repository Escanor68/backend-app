import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import { Payment } from '../../src/models/payment.model';
import { config } from '../../src/config';
import express from 'express';
import paymentRoutes from '../../src/routes/payment.routes';

describe('Payment Endpoints (e2e)', () => {
  let app: express.Application;
  let authToken: string;

  beforeAll(async () => {
    // Inicializar la base de datos de prueba
    await AppDataSource.initialize();
    
    // Configurar la aplicación Express
    app = express();
    app.use(express.json());
    app.use('/api/payments', paymentRoutes);

    // Generar token de prueba
    authToken = 'test-token'; // En un caso real, generarías un JWT válido
  });

  afterAll(async () => {
    // Limpiar la base de datos y cerrar conexión
    await AppDataSource.getRepository(Payment).clear();
    await AppDataSource.destroy();
  });

  describe('POST /api/payments/preference', () => {
    it('should create a payment preference', async () => {
      const payload = {
        items: [{
          title: 'Test Product',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: 100
        }],
        payer: {
          email: 'test@example.com'
        }
      };

      const response = await request(app)
        .post('/api/payments/preference')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('init_point');
    });

    it('should reject request without authentication', async () => {
      const payload = {
        items: [{
          title: 'Test Product',
          quantity: 1,
          currency_id: 'ARS',
          unit_price: 100
        }],
        payer: {
          email: 'test@example.com'
        }
      };

      const response = await request(app)
        .post('/api/payments/preference')
        .send(payload);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/payments/:id/status', () => {
    it('should get payment status', async () => {
      // Primero crear un pago en la base de datos
      const payment = await AppDataSource.getRepository(Payment).save({
        userId: 'test@example.com',
        amount: 100,
        currency: 'ARS',
        status: 'PENDING',
        mercadoPagoId: 'mp-123'
      });

      const response = await request(app)
        .get(`/api/payments/${payment.id}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.id).toBe(payment.id);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/non-existent/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 