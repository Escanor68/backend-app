import { PaymentService } from '../../../src/services/payment.service';
import { Payment } from '../../../src/models/payment.model';
import { AppDataSource } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

// Mock MercadoPago SDK
const mockPreferenceCreate = jest.fn();
const mockPaymentGet = jest.fn();

jest.mock('mercadopago', () => ({
    Preference: jest.fn().mockImplementation(() => ({
        create: mockPreferenceCreate,
    })),
    Payment: jest.fn().mockImplementation(() => ({
        get: mockPaymentGet,
    })),
}));

// Mock config
jest.mock('../../../src/config', () => ({
    config: {
        mercadoPago: {
            accessToken: 'test-access-token',
        },
        cors: {
            origin: 'http://localhost:3000',
        },
    },
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

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(
            mockRepository,
        );

        // Reset mocks
        mockPreferenceCreate.mockClear();
        mockPaymentGet.mockClear();
        mockRepository.create.mockClear();
        mockRepository.save.mockClear();
        mockRepository.findOne.mockClear();

        paymentService = new PaymentService();
    });

    describe('createPreference', () => {
        it('should create a payment preference successfully', async () => {
            const mockPreferenceData = {
                amount: 100,
                bookingId: 'booking-123',
                title: 'Test Cancha',
                payer: {
                    email: 'test@example.com',
                },
            };

            const mockPreferenceResult = {
                id: 'pref-123',
                init_point: 'https://mercadopago.com/checkout/pref-123',
            };

            const mockPayment = {
                id: 'payment-123',
                amount: 100,
                status: 'pending',
            };

            mockPreferenceCreate.mockResolvedValue(mockPreferenceResult);
            mockRepository.create.mockReturnValue(mockPayment);
            mockRepository.save.mockResolvedValue(mockPayment);

            const result = await paymentService.createPreference(
                mockPreferenceData,
            );

            expect(mockPreferenceCreate).toHaveBeenCalledWith({
                body: expect.objectContaining({
                    items: expect.arrayContaining([
                        expect.objectContaining({
                            id: 'booking-booking-123',
                            title: 'Test Cancha',
                            quantity: 1,
                            currency_id: 'ARS',
                            unit_price: 100,
                        }),
                    ]),
                    payer: { email: 'test@example.com' },
                }),
            });

            expect(mockRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 100,
                    status: 'pending',
                    paymentMethod: 'mercadopago',
                    bookingId: 'booking-123',
                    preferenceId: 'pref-123',
                }),
            );

            expect(mockRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockPreferenceResult);
        });

        it('should handle errors when creating preference', async () => {
            const mockPreferenceData = {
                amount: 100,
                payer: {
                    email: 'test@example.com',
                },
            };

            mockPreferenceCreate.mockRejectedValue(
                new Error('MercadoPago API error'),
            );

            await expect(
                paymentService.createPreference(mockPreferenceData),
            ).rejects.toThrow('MercadoPago API error');
        });
    });

    describe('getPaymentStatus', () => {
        it('should return payment status from database', async () => {
            const mockPayment = {
                id: 'payment-123',
                status: 'approved',
                preferenceId: 'pref-123',
                mercadoPagoId: 'mp-123',
                metadata: {
                    statusDetail: 'Payment approved',
                },
            };

            const mockMPPayment = {
                id: 'mp-123',
                status: 'approved',
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentGet.mockResolvedValue(mockMPPayment);
            mockRepository.save.mockResolvedValue(mockPayment);

            const result = await paymentService.getPaymentStatus('payment-123');

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'payment-123' },
            });

            expect(result).toEqual({
                id: 'payment-123',
                status: 'approved',
                detail: 'Payment approved',
                preferenceId: 'pref-123',
            });
        });

        it('should throw error when payment not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(
                paymentService.getPaymentStatus('non-existent'),
            ).rejects.toThrow('Pago no encontrado');
        });

        it('should handle payment without mercadoPagoId', async () => {
            const mockPayment = {
                id: 'payment-123',
                status: 'pending',
                preferenceId: 'pref-123',
                mercadoPagoId: null,
                metadata: {},
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);

            const result = await paymentService.getPaymentStatus('payment-123');

            expect(result).toEqual({
                id: 'payment-123',
                status: 'pending',
                detail: 'Estado desconocido',
                preferenceId: 'pref-123',
            });
        });
    });

    describe('processPayment', () => {
        it('should process payment successfully', async () => {
            const mockPaymentData = {
                preference_id: 'pref-123',
                payment_id: 'mp-123',
            };

            const mockPayment = {
                id: 'payment-123',
                preferenceId: 'pref-123',
                status: 'pending',
                metadata: {},
            };

            const mockMPPayment = {
                id: 'mp-123',
                status: 'approved',
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockPaymentGet.mockResolvedValue(mockMPPayment);
            mockRepository.save.mockResolvedValue({
                ...mockPayment,
                status: 'approved',
                mercadoPagoId: 'mp-123',
            });

            const result = await paymentService.processPayment(mockPaymentData);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { preferenceId: 'pref-123' },
            });
            expect(mockPaymentGet).toHaveBeenCalledWith({ id: 'mp-123' });
            expect(result.status).toBe('approved');
            expect(result.mercadoPagoId).toBe('mp-123');
        });

        it('should throw error when payment not found', async () => {
            const mockPaymentData = {
                preference_id: 'pref-nonexistent',
                payment_id: 'mp-123',
            };

            mockRepository.findOne.mockResolvedValue(null);

            await expect(
                paymentService.processPayment(mockPaymentData),
            ).rejects.toThrow('Pago no encontrado');
        });
    });

    describe('requestRefund', () => {
        it('should request refund successfully', async () => {
            const mockPayment = {
                id: 'payment-123',
                mercadoPagoId: 'mp-123',
                amount: 100,
                refund: null,
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockRepository.save.mockResolvedValue({
                ...mockPayment,
                refund: {
                    id: '',
                    status: 'pending',
                    reason: 'Reembolso solicitado',
                    amount: 100,
                    date: expect.any(Date),
                },
            });

            const result = await paymentService.requestRefund('payment-123');

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'payment-123' },
            });
            expect(result).toEqual(
                expect.objectContaining({
                    status: 'pending',
                    reason: 'Reembolso solicitado',
                    amount: 100,
                }),
            );
        });

        it('should throw error when payment not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(
                paymentService.requestRefund('payment-123'),
            ).rejects.toThrow('Pago no encontrado o sin ID de Mercado Pago');
        });
    });
});
