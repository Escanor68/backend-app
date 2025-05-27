import { Payment } from '../../src/models/payment.model';
import { AppDataSource } from '../../src/config/database';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config';

export const createTestPayment = async (data: Partial<Payment> = {}): Promise<Payment> => {
  const paymentRepository = AppDataSource.getRepository(Payment);
  
  const defaultData = {
    userId: 'test@example.com',
    amount: 100,
    currency: 'ARS',
    status: 'PENDING',
    ...data
  };

  return await paymentRepository.save(defaultData);
};

export const generateTestToken = (userId: string = 'test-user'): string => {
  return jwt.sign(
    { sub: userId, email: 'test@example.com' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );
};

export const clearDatabase = async (): Promise<void> => {
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.clear();
  }
};

export const mockMercadoPagoResponse = {
  preference: {
    id: 'test-pref-id',
    init_point: 'https://mercadopago.com/checkout/test',
    items: [{
      title: 'Test Product',
      quantity: 1,
      currency_id: 'ARS',
      unit_price: 100
    }]
  },
  payment: {
    id: 'test-payment-id',
    status: 'approved',
    status_detail: 'accredited',
    transaction_amount: 100,
    currency_id: 'ARS'
  }
}; 