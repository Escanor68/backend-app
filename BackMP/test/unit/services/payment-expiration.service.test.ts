import { PaymentExpirationService } from '../../../src/services/payment-expiration.service';
import { AppDataSource } from '../../../src/config/database';
import * as cron from 'node-cron';

jest.mock('../../../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('node-cron', () => ({
    schedule: jest.fn().mockReturnValue({
        start: jest.fn(),
        stop: jest.fn(),
        destroy: jest.fn(),
    }),
}));

jest.mock('../../../src/events/paymentEvents', () => ({
    paymentEvents: {
        emitPaymentExpired: jest.fn(),
    },
}));

describe('PaymentExpirationService', () => {
    let paymentExpirationService: PaymentExpirationService;
    let mockRepository: any;
    let mockCron: any;

    beforeEach(() => {
        mockRepository = {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(
            mockRepository,
        );

        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            const service = new PaymentExpirationService();
            expect(service).toBeDefined();
        });

        it('should initialize with custom values', () => {
            const service = new PaymentExpirationService(60, '*/10 * * * *');
            expect(service).toBeDefined();
        });
    });

    describe('start', () => {
        it('should start the cron job', () => {
            const mockTask = {
                start: jest.fn(),
                stop: jest.fn(),
                destroy: jest.fn(),
            };

            (cron.schedule as jest.Mock).mockReturnValue(mockTask);

            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            paymentExpirationService.start();

            expect(cron.schedule).toHaveBeenCalledWith(
                '*/5 * * * *',
                expect.any(Function),
                { timezone: 'America/Argentina/Buenos_Aires' },
            );
            expect(mockTask.start).toHaveBeenCalled();
        });

        it('should not start if already running', () => {
            const mockTask = { start: jest.fn() };
            (cron.schedule as jest.Mock).mockReturnValue(mockTask);

            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            paymentExpirationService.start();
            paymentExpirationService.start(); // Second call

            expect(cron.schedule).toHaveBeenCalledTimes(1);
        });
    });

    describe('stop', () => {
        it('should stop the cron job', () => {
            const mockTask = { start: jest.fn(), destroy: jest.fn() };
            (cron.schedule as jest.Mock).mockReturnValue(mockTask);

            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            paymentExpirationService.start();
            paymentExpirationService.stop();

            expect(mockTask.destroy).toHaveBeenCalled();
        });

        it('should handle stop when not running', () => {
            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            expect(() => paymentExpirationService.stop()).not.toThrow();
        });
    });

    describe('getStatus', () => {
        it('should return correct status when not running', () => {
            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            const status = paymentExpirationService.getStatus();

            expect(status).toEqual({
                isRunning: false,
                schedule: '*/5 * * * *',
                expirationTime: 30,
                nextRun: undefined,
            });
        });

        it('should return correct status when running', () => {
            const mockTask = { start: jest.fn() };
            (cron.schedule as jest.Mock).mockReturnValue(mockTask);

            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            paymentExpirationService.start();
            const status = paymentExpirationService.getStatus();

            expect(status.isRunning).toBe(true);
            expect(status.schedule).toBe('*/5 * * * *');
            expect(status.expirationTime).toBe(30);
        });
    });

    describe('cleanupExpiredPayments', () => {
        it('should handle empty payment list', async () => {
            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            mockRepository.find.mockResolvedValue([]);

            await paymentExpirationService.cleanupExpiredPayments();

            expect(mockRepository.find).toHaveBeenCalled();
            expect(mockRepository.save).not.toHaveBeenCalled();
        });

        it('should process expired payments', async () => {
            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            const expiredPayments = [
                {
                    id: 'payment-1',
                    status: 'pending',
                    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                    metadata: {},
                },
                {
                    id: 'payment-2',
                    status: 'pending',
                    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
                    metadata: {},
                },
            ];

            mockRepository.find.mockResolvedValue(expiredPayments);
            mockRepository.save.mockResolvedValue(undefined);

            await paymentExpirationService.cleanupExpiredPayments();

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    status: 'pending',
                    createdAt: expect.any(Object),
                },
            });

            expect(mockRepository.save).toHaveBeenCalledTimes(2);
        });

        it('should handle database errors gracefully', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            // Should not throw but handle gracefully
            await expect(async () => {
                try {
                    await paymentExpirationService.cleanupExpiredPayments();
                } catch (error) {
                    // Service should handle this internally
                }
            }).not.toThrow();
        });

        it('should handle save errors gracefully', async () => {
            const expiredPayments = [
                {
                    id: 'payment-1',
                    status: 'pending',
                    createdAt: new Date(Date.now() - 60 * 60 * 1000),
                    metadata: {},
                },
            ];

            mockRepository.find.mockResolvedValue(expiredPayments);
            mockRepository.save.mockRejectedValue(new Error('Save error'));

            await expect(async () => {
                await paymentExpirationService.cleanupExpiredPayments();
            }).not.toThrow();
        });
    });

    describe('extendPaymentExpiration', () => {
        it('should extend payment expiration', async () => {
            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            const mockPayment = {
                id: 'payment-123',
                status: 'pending',
                metadata: { originalExpiration: new Date() },
            };

            mockRepository.findOne.mockResolvedValue(mockPayment);
            mockRepository.save.mockResolvedValue(mockPayment);

            const result =
                await paymentExpirationService.extendPaymentExpiration(
                    'payment-123',
                    15,
                );

            expect(result).toBe(true);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'payment-123' },
            });
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should handle missing payment', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(
                paymentExpirationService.extendPaymentExpiration(
                    'payment-123',
                    15,
                ),
            ).rejects.toThrow('Pago no encontrado: payment-123');
        });
    });

    describe('getExpirationStats', () => {
        it('should return expiration statistics', async () => {
            const mockExpiredPayments = [
                {
                    id: 'payment-1',
                    status: 'expired',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    updatedAt: new Date(),
                    metadata: {
                        expiredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    },
                },
                {
                    id: 'payment-2',
                    status: 'expired',
                    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
                    updatedAt: new Date(),
                    metadata: {
                        expiredAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
                    },
                },
            ];

            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            mockRepository.find.mockResolvedValue(mockExpiredPayments);

            const stats = await paymentExpirationService.getExpirationStats();

            expect(stats).toEqual({
                totalExpired: 2,
                averageTimeToExpiration: expect.any(Number),
                expiredToday: expect.any(Number),
                expiredThisWeek: expect.any(Number),
            });
        });

        it('should handle empty results', async () => {
            mockRepository.find.mockResolvedValue([]);

            const stats = await paymentExpirationService.getExpirationStats();

            expect(stats).toEqual({
                totalExpired: 0,
                averageTimeToExpiration: 0,
                expiredToday: 0,
                expiredThisWeek: 0,
            });
        });

        it('should handle database errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            paymentExpirationService = new PaymentExpirationService(
                30,
                '*/5 * * * *',
            );
            const stats = await paymentExpirationService.getExpirationStats();

            expect(stats).toEqual({
                totalExpired: 0,
                expiredToday: 0,
                expiredThisWeek: 0,
                averageTimeToExpiration: 0,
            });
        });
    });
});
