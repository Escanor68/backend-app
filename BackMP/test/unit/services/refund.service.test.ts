import { RefundService } from '../../../src/services/refund.service';
import { AppDataSource } from '../../../src/config/database';
import { Payment } from '../../../src/models/payment.model';

jest.mock('../../../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('mercadopago', () => ({
    MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
    PaymentRefund: jest.fn().mockImplementation(() => ({
        create: jest.fn(),
        get: jest.fn(),
    })),
}));

jest.mock('../../../src/config', () => ({
    config: {
        mercadoPago: {
            accessToken: 'test-access-token',
        },
    },
}));

describe('RefundService', () => {
    let refundService: RefundService;
    let mockRepository: any;
    let mockPaymentRefund: any;

    beforeEach(() => {
        mockRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };

        mockPaymentRefund = {
            create: jest.fn(),
            get: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(
            mockRepository,
        );

        // Mock the PaymentRefund constructor
        const { PaymentRefund } = require('mercadopago');
        PaymentRefund.mockImplementation(() => mockPaymentRefund);

        refundService = new RefundService();

        jest.clearAllMocks();
    });

    describe('processRefund', () => {
        const mockPayment = {
            id: 'payment-123',
            mercadoPagoId: 'mp-payment-123',
            amount: 100,
            status: 'approved',
            refund: null,
            createdAt: new Date('2023-01-01'),
        };

        it('should process full refund successfully', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                amount: 100,
                status: 'approved',
                createdAt: new Date(), // Today
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentRefund.create.mockResolvedValue({
                id: 'refund-123',
                status: 'approved',
            });
            mockRepository.save.mockResolvedValue({
                ...mockPayment,
                refund: { id: 'refund-123', status: 'approved', amount: 100 },
            });

            const result = await refundService.processRefund({
                paymentId: 'payment-123',
                amount: 100,
                reason: 'Test',
            });

            expect(result).toEqual({
                id: 'refund-123',
                status: 'approved',
                amount: 100,
                paymentId: 'payment-123',
                reason: 'Test',
                dateCreated: expect.any(String),
                metadata: undefined,
            });
        });

        it('should process partial refund successfully', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                amount: 100,
                status: 'approved',
                createdAt: new Date(), // Today
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentRefund.create.mockResolvedValue({
                id: 'refund-123',
                status: 'approved',
            });
            mockRepository.save.mockResolvedValue({
                ...mockPayment,
                refund: { id: 'refund-123', status: 'approved', amount: 50 },
            });

            const result = await refundService.processRefund({
                paymentId: 'payment-123',
                amount: 50,
                reason: 'Test',
            });

            expect(result).toEqual({
                id: 'refund-123',
                status: 'approved',
                amount: 50,
                paymentId: 'payment-123',
                reason: 'Test',
                dateCreated: expect.any(String),
                metadata: undefined,
            });
        });

        it('should throw error when payment not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(
                refundService.processRefund({
                    paymentId: 'non-existent',
                    amount: 100,
                    reason: 'Test',
                }),
            ).rejects.toThrow('Pago no encontrado: non-existent');
        });

        it('should throw error when payment has no MercadoPago ID', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: null,
                amount: 100,
                status: 'approved',
                createdAt: new Date(),
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);

            await expect(
                refundService.processRefund({
                    paymentId: 'payment-123',
                    amount: 100,
                    reason: 'Test',
                }),
            ).rejects.toThrow('El pago no tiene ID de Mercado Pago asociado');
        });

        it('should throw error when payment status is not approved', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                amount: 100,
                status: 'pending',
                createdAt: new Date(),
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);

            await expect(
                refundService.processRefund({
                    paymentId: 'payment-123',
                    amount: 100,
                    reason: 'Test',
                }),
            ).rejects.toThrow(
                'No se puede reembolsar un pago con estado: pending',
            );
        });

        it('should throw error when payment already refunded', async () => {
            const paymentWithRefund = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                amount: 100,
                status: 'approved',
                createdAt: new Date(), // Today
                refund: {
                    id: 'refund-123',
                    status: 'completed',
                    amount: 100,
                },
            };

            mockRepository.findOne.mockResolvedValue(paymentWithRefund);

            await expect(
                refundService.processRefund({
                    paymentId: 'payment-123',
                    amount: 50,
                    reason: 'Test',
                }),
            ).rejects.toThrow('Este pago ya fue reembolsado completamente');
        });

        it('should throw error when refund amount exceeds payment amount', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                amount: 100,
                status: 'approved',
                createdAt: new Date(), // Today
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);

            await expect(
                refundService.processRefund({
                    paymentId: 'payment-123',
                    amount: 150,
                    reason: 'Test',
                }),
            ).rejects.toThrow(
                'El monto a reembolsar no puede ser mayor al monto del pago',
            );
        });

        it('should throw error when payment is too old for refund', async () => {
            const oldPayment = {
                id: 'payment-old',
                mercadoPagoId: 'mp-payment-old',
                amount: 100,
                status: 'approved',
                createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(oldPayment);

            await expect(
                refundService.processRefund({
                    paymentId: 'payment-old',
                    amount: 50,
                    reason: 'Test',
                }),
            ).rejects.toThrow(
                'No se pueden procesar reembolsos después de 180 días',
            );
        });

        it('should handle MercadoPago API errors', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                amount: 100,
                status: 'approved',
                createdAt: new Date(), // Today
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentRefund.create.mockRejectedValue(
                new Error('MP API Error'),
            );

            await expect(
                refundService.processRefund({
                    paymentId: 'payment-123',
                    amount: 50,
                    reason: 'Test',
                }),
            ).rejects.toThrow('MP API Error');
        });

        it('should handle repository save errors', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                amount: 100,
                status: 'approved',
                createdAt: new Date(), // Today
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentRefund.create.mockResolvedValue({
                id: 'refund-123',
                status: 'approved',
            });
            mockRepository.save.mockRejectedValue(new Error('Save error'));

            await expect(
                refundService.processRefund({
                    paymentId: 'payment-123',
                    amount: 50,
                    reason: 'Test',
                }),
            ).rejects.toThrow('Save error');
        });
    });

    describe('getRefundStatus', () => {
        it('should return refund status when refund exists', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                refund: {
                    id: 'refund-123',
                    status: 'approved',
                    amount: 100,
                    reason: 'Customer request',
                    date: new Date(),
                },
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentRefund.get.mockResolvedValue({
                id: 'refund-123',
                status: 'approved',
                amount: 100,
                date_created: '2023-01-02T00:00:00Z',
            });

            const result = await refundService.getRefundStatus('payment-123');

            expect(result).toEqual({
                id: 'refund-123',
                status: 'approved',
                amount: 100,
                reason: 'Customer request',
                date: expect.any(Date),
            });
        });

        it('should throw error when payment not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(
                refundService.getRefundStatus('non-existent'),
            ).rejects.toThrow(
                'No se encontró información de reembolso para este pago',
            );
        });

        it('should throw error when payment has no refund', async () => {
            const paymentWithoutRefund = { id: 'payment-123', refund: null };
            mockRepository.findOne.mockResolvedValue(paymentWithoutRefund);

            await expect(
                refundService.getRefundStatus('payment-123'),
            ).rejects.toThrow(
                'No se encontró información de reembolso para este pago',
            );
        });

        it('should handle MercadoPago API errors when fetching status', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                refund: {
                    id: 'refund-123',
                    status: 'pending',
                    amount: 100,
                    reason: 'Customer request',
                    date: new Date(),
                },
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentRefund.get.mockRejectedValue(new Error('MP API Error'));

            const result = await refundService.getRefundStatus('payment-123');

            expect(result).toEqual({
                id: 'refund-123',
                status: 'pending',
                amount: 100,
                reason: 'Customer request',
                date: expect.any(Date),
            });
        });
    });

    describe('error handling', () => {
        it('should handle repository save errors', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-payment-123',
                amount: 100,
                status: 'approved',
                createdAt: new Date(), // Today
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentRefund.create.mockResolvedValue({
                id: 'refund-123',
                status: 'approved',
            });
            mockRepository.save.mockRejectedValue(new Error('Save error'));

            await expect(
                refundService.processRefund({
                    paymentId: 'payment-123',
                    amount: 50,
                    reason: 'Test',
                }),
            ).rejects.toThrow('Save error');
        });
    });
});
