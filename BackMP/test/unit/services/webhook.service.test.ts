import { WebhookService } from '../../../src/services/webhook.service';
import { AppDataSource } from '../../../src/config/database';
import { Payment } from '../../../src/models/payment.model';

jest.mock('../../../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('mercadopago', () => ({
    Payment: jest.fn().mockImplementation(() => ({
        get: jest.fn(),
    })),
}));

jest.mock('../../../src/config', () => ({
    config: {
        mercadoPago: {
            accessToken: 'test-access-token',
            webhookSecret: 'test-webhook-secret',
        },
    },
}));

jest.mock('../../../src/events/paymentEvents', () => ({
    paymentEvents: {
        emitPaymentStatusUpdate: jest.fn(),
        emitRefundProcessed: jest.fn(),
    },
}));

// Helper function to create valid webhook events
const createWebhookEvent = (type: string, action: string, dataId: string) => ({
    api_version: '1.0',
    date_created: '2023-01-01T00:00:00Z',
    id: 123,
    live_mode: false,
    user_id: 'user-123',
    type,
    action,
    data: { id: dataId },
});

describe('WebhookService', () => {
    let webhookService: WebhookService;
    let mockRepository: any;
    let mockMPPayment: any;

    beforeEach(() => {
        mockRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        mockMPPayment = {
            get: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(
            mockRepository,
        );

        const { Payment } = require('mercadopago');
        Payment.mockImplementation(() => mockMPPayment);

        webhookService = new WebhookService();

        jest.clearAllMocks();
    });

    describe('validateSignature', () => {
        it('should validate correct signature', () => {
            const payload = { type: 'payment', data: { id: 'test' } };
            const signature = 'v1=valid-signature';
            const requestId = 'request-123';

            // Mock crypto operations
            const crypto = require('crypto');
            const mockHmac = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('valid-signature'),
            };
            jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac);

            const result = webhookService.validateSignature(
                payload,
                signature,
                requestId,
            );

            expect(result).toBe(true);
            expect(crypto.createHmac).toHaveBeenCalledWith(
                'sha256',
                'test-webhook-secret',
            );
        });

        it('should reject invalid signature', () => {
            const payload = { type: 'payment', data: { id: 'test' } };
            const signature = 'v1=invalid-signature';
            const requestId = 'request-123';

            const crypto = require('crypto');
            const mockHmac = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('valid-signature'),
            };
            jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac);

            const result = webhookService.validateSignature(
                payload,
                signature,
                requestId,
            );

            expect(result).toBe(false);
        });

        it('should handle malformed signature format', () => {
            const payload = { type: 'payment', data: { id: 'test' } };
            const signature = 'malformed-signature';
            const requestId = 'request-123';

            const result = webhookService.validateSignature(
                payload,
                signature,
                requestId,
            );

            expect(result).toBe(false);
        });

        it('should handle missing signature', () => {
            const payload = { type: 'payment', data: { id: 'test' } };
            const signature = '';
            const requestId = 'request-123';

            const result = webhookService.validateSignature(
                payload,
                signature,
                requestId,
            );

            expect(result).toBe(false);
        });
    });

    describe('processWebhookEvent', () => {
        const mockPayment = {
            id: 'payment-123',
            mercadoPagoId: 'mp-payment-123',
            status: 'pending',
            amount: 100,
        };

        it('should process payment update webhook successfully', async () => {
            const webhookEvent = createWebhookEvent(
                'payment',
                'payment.updated',
                'mp-payment-123',
            );

            const mpPaymentData = {
                id: 'mp-payment-123',
                status: 'approved',
                status_detail: 'accredited',
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockMPPayment.get.mockResolvedValue(mpPaymentData);
            mockRepository.save.mockResolvedValue({
                ...mockPayment,
                status: 'approved',
            });

            await webhookService.processWebhookEvent(webhookEvent);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { mercadoPagoId: 'mp-payment-123' },
            });

            expect(mockMPPayment.get).toHaveBeenCalledWith({
                id: 'mp-payment-123',
            });
        });

        it('should handle payment creation webhook', async () => {
            const webhookEvent = createWebhookEvent(
                'payment',
                'payment.created',
                'mp-payment-new',
            );

            const mpPaymentData = {
                id: 'mp-payment-new',
                status: 'pending',
                status_detail: 'pending_waiting_payment',
            };

            mockRepository.findOne.mockResolvedValue(null); // Payment not found locally
            mockMPPayment.get.mockResolvedValue(mpPaymentData);

            await webhookService.processWebhookEvent(webhookEvent);

            expect(mockMPPayment.get).toHaveBeenCalledWith({
                id: 'mp-payment-new',
            });

            // Should not attempt to save since payment doesn't exist locally
            expect(mockRepository.save).not.toHaveBeenCalled();
        });

        it('should handle non-payment webhook events', async () => {
            const webhookEvent = createWebhookEvent(
                'plan',
                'plan.updated',
                'plan-123',
            );

            await webhookService.processWebhookEvent(webhookEvent);

            // Should not interact with payment repository for non-payment events
            expect(mockRepository.findOne).not.toHaveBeenCalled();
            expect(mockMPPayment.get).not.toHaveBeenCalled();
        });

        it('should handle MercadoPago API errors gracefully', async () => {
            const webhookEvent = createWebhookEvent(
                'payment',
                'payment.updated',
                'mp-payment-123',
            );

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockMPPayment.get.mockRejectedValue(new Error('MP API Error'));

            // Should not throw
            await expect(
                webhookService.processWebhookEvent(webhookEvent),
            ).resolves.not.toThrow();

            expect(mockRepository.save).not.toHaveBeenCalled();
        });

        it('should handle database errors gracefully', async () => {
            const webhookEvent = createWebhookEvent(
                'payment',
                'payment.updated',
                'mp-payment-123',
            );

            mockRepository.findOne.mockRejectedValue(
                new Error('Database error'),
            );

            // Should not throw
            await expect(
                webhookService.processWebhookEvent(webhookEvent),
            ).resolves.not.toThrow();
        });
    });

    describe('error handling', () => {
        it('should handle crypto errors gracefully', () => {
            const payload = { type: 'payment', data: { id: 'test' } };
            const signature = 'v1=valid-signature';
            const requestId = 'request-123';

            const crypto = require('crypto');
            jest.spyOn(crypto, 'createHmac').mockImplementation(() => {
                throw new Error('Crypto error');
            });

            const result = webhookService.validateSignature(
                payload,
                signature,
                requestId,
            );

            expect(result).toBe(false);
        });
    });
});
