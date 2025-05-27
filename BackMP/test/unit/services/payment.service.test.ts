import { PaymentService } from '../../../src/services/payment.service';
import { Payment } from '../../../src/models/payment.model';
import { PaymentPreferenceData } from '../../../src/types/payment.types';
import { AppDataSource } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn().mockImplementation(() => ({
    accessToken: 'test-token',
  })),
  Preference: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
  Payment: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    refund: jest.fn(),
  })),
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    paymentService = new PaymentService();
  });

  describe('createPreference', () => {
    it('should create a payment preference successfully', async () => {
      const mockPreferenceData: PaymentPreferenceData = {
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

      const mockPreferenceResult = {
        id: 'pref-123',
        init_point: 'https://mercadopago.com/checkout/pref-123'
      };

      mockRepository.create.mockReturnValue(new Payment());
      mockRepository.save.mockResolvedValue({ id: 'payment-123' });

      const result = await paymentService.createPreference(mockPreferenceData);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle errors when creating preference', async () => {
      const mockPreferenceData: PaymentPreferenceData = {
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

      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(paymentService.createPreference(mockPreferenceData))
        .rejects
        .toThrow('Failed to create payment preference');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status from database', async () => {
      const mockPayment = {
        id: 'payment-123',
        status: 'approved',
        preferenceId: 'pref-123',
        mercadoPagoId: 'mp-123'
      };

      mockRepository.findOne.mockResolvedValue(mockPayment);

      const result = await paymentService.getPaymentStatus('payment-123');

      expect(result).toEqual({
        id: 'payment-123',
        status: 'approved',
        detail: 'Local payment status',
        preferenceId: 'pref-123',
        mercadoPagoId: 'mp-123'
      });
    });

    it('should throw error when payment not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(paymentService.getPaymentStatus('non-existent'))
        .rejects
        .toThrow('Payment not found');
    });
  });
}); 