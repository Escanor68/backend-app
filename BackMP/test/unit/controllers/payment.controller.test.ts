import { PaymentController } from '../../../src/controllers/payment.controller';
import { PaymentService } from '../../../src/services/payment.service';
import { RefundService } from '../../../src/services/refund.service';
import { WebhookService } from '../../../src/services/webhook.service';
import { AuditService } from '../../../src/services/audit.service';
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../../src/config/database';

// Mocks
jest.mock('../../../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('../../../src/services/payment.service');
jest.mock('../../../src/services/refund.service');
jest.mock('../../../src/services/webhook.service');
jest.mock('../../../src/services/audit.service');
jest.mock('../../../src/services/invoice.service');

describe('PaymentController', () => {
    let paymentController: PaymentController;
    let mockPaymentService: jest.Mocked<PaymentService>;
    let mockRefundService: jest.Mocked<RefundService>;
    let mockWebhookService: jest.Mocked<WebhookService>;
    let mockAuditService: jest.Mocked<AuditService>;
    let mockRepository: any;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // Setup mocks
        mockRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(
            mockRepository,
        );

        // Create properly mocked services
        mockPaymentService = {
            createPreference: jest.fn(),
            processPayment: jest.fn(),
            getPaymentStatus: jest.fn(),
            requestRefund: jest.fn(),
        } as any;

        mockRefundService = {
            processRefund: jest.fn(),
            getRefundStatus: jest.fn(),
        } as any;

        mockWebhookService = {
            validateSignature: jest.fn(),
            processWebhookEvent: jest.fn(),
        } as any;

        mockAuditService = {
            logRefundOperation: jest.fn(),
            logPaymentAccess: jest.fn(),
        } as any;

        // Mock the service constructors
        (PaymentService as jest.Mock).mockImplementation(
            () => mockPaymentService,
        );
        (RefundService as jest.Mock).mockImplementation(
            () => mockRefundService,
        );
        (WebhookService as jest.Mock).mockImplementation(
            () => mockWebhookService,
        );
        (AuditService as jest.Mock).mockImplementation(() => mockAuditService);

        paymentController = new PaymentController();

        // Setup request/response mocks
        mockRequest = {
            params: {},
            body: {},
            user: {
                id: 'user-123',
                email: 'test@example.com',
                roles: ['user'],
            },
            headers: {},
            ip: '127.0.0.1',
            path: '/test',
            method: 'POST',
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            download: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('createPaymentPreference', () => {
        it('should create a payment preference successfully', async () => {
            const mockPreference: any = {
                id: 'pref-123',
                init_point: 'https://mercadopago.com/checkout/pref-123',
                api_response: {
                    status: 201,
                    headers: [['content-type', ['application/json']]],
                },
            };

            mockPaymentService.createPreference.mockResolvedValue(
                mockPreference,
            );
            mockRequest.body = {
                amount: 100,
                bookingId: 'booking-123',
                title: 'Test Cancha',
                payer: { email: 'test@example.com' },
            };

            await paymentController.createPaymentPreference(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockPaymentService.createPreference).toHaveBeenCalledWith(
                mockRequest.body,
            );
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockPreference);
        });

        it('should handle errors during preference creation', async () => {
            const error = new Error('Payment service error');
            mockPaymentService.createPreference.mockRejectedValue(error);

            await paymentController.createPaymentPreference(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('refundPayment', () => {
        beforeEach(() => {
            mockRequest.params = { id: 'payment-123' };
            mockRequest.body = { reason: 'Customer request', amount: 100 };
        });

        it('should process refund successfully', async () => {
            const mockRefundResponse = {
                id: 'refund-123',
                paymentId: 'payment-123',
                amount: 100,
                status: 'approved' as const,
                dateCreated: new Date().toISOString(),
                reason: 'Customer request',
            };

            mockRefundService.processRefund.mockResolvedValue(
                mockRefundResponse,
            );
            mockAuditService.logRefundOperation.mockResolvedValue();

            await paymentController.refundPayment(
                mockRequest as Request,
                mockResponse as Response,
            );

            expect(mockAuditService.logRefundOperation).toHaveBeenCalledWith(
                mockRequest,
                'payment-123',
                'refund_request',
                true,
                100,
                'Customer request',
            );

            expect(mockRefundService.processRefund).toHaveBeenCalledWith({
                paymentId: 'payment-123',
                amount: 100,
                reason: 'Customer request',
                metadata: {
                    requestedBy: 'user-123',
                    requestIP: '127.0.0.1',
                    requestTimestamp: expect.any(Date),
                },
            });

            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Reembolso procesado correctamente',
                refund: mockRefundResponse,
            });
        });

        it('should handle refund processing errors', async () => {
            const error = new Error('Refund failed');
            mockRefundService.processRefund.mockRejectedValue(error);
            mockAuditService.logRefundOperation.mockResolvedValue();

            await paymentController.refundPayment(
                mockRequest as Request,
                mockResponse as Response,
            );

            expect(mockAuditService.logRefundOperation).toHaveBeenCalledWith(
                mockRequest,
                'payment-123',
                'refund_failed',
                false,
                100,
                'Customer request',
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error al procesar reembolso',
                error: 'Refund failed',
            });
        });
    });

    describe('getRefundStatus', () => {
        beforeEach(() => {
            mockRequest.params = { id: 'payment-123' };
        });

        it('should get refund status successfully', async () => {
            const mockRefundStatus = {
                status: 'approved',
                amount: 100,
                reason: 'Customer request',
                date: new Date(),
            };

            mockRefundService.getRefundStatus.mockResolvedValue(
                mockRefundStatus,
            );
            mockAuditService.logRefundOperation.mockResolvedValue();

            await paymentController.getRefundStatus(
                mockRequest as Request,
                mockResponse as Response,
            );

            expect(mockAuditService.logRefundOperation).toHaveBeenCalledWith(
                mockRequest,
                'payment-123',
                'refund_status_access',
                true,
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                refundStatus: 'approved',
                refundDetails: mockRefundStatus,
            });
        });

        it('should handle refund status errors', async () => {
            const error = new Error('Refund not found');
            mockRefundService.getRefundStatus.mockRejectedValue(error);
            mockAuditService.logRefundOperation.mockResolvedValue();

            await paymentController.getRefundStatus(
                mockRequest as Request,
                mockResponse as Response,
            );

            expect(mockAuditService.logRefundOperation).toHaveBeenCalledWith(
                mockRequest,
                'payment-123',
                'refund_status_error',
                false,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
        });
    });

    describe('handleWebhook', () => {
        beforeEach(() => {
            mockRequest.headers = {
                'x-signature': 'valid-signature',
                'x-request-id': 'request-123',
            };
            mockRequest.body = {
                type: 'payment',
                action: 'payment.updated',
                data: { id: 'mp-payment-123' },
            };
        });

        it('should process valid webhook successfully', async () => {
            mockWebhookService.validateSignature.mockReturnValue(true);
            mockWebhookService.processWebhookEvent.mockResolvedValue();

            await paymentController.handleWebhook(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockWebhookService.validateSignature).toHaveBeenCalledWith(
                mockRequest.body,
                'valid-signature',
                'request-123',
            );

            expect(mockWebhookService.processWebhookEvent).toHaveBeenCalledWith(
                mockRequest.body,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Webhook procesado correctamente',
                eventType: 'payment',
                dataId: 'mp-payment-123',
            });
        });

        it('should reject webhook with invalid signature', async () => {
            mockWebhookService.validateSignature.mockReturnValue(false);

            await paymentController.handleWebhook(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Firma inválida',
                message: 'Webhook signature validation failed',
            });

            expect(
                mockWebhookService.processWebhookEvent,
            ).not.toHaveBeenCalled();
        });

        it('should reject webhook with invalid format', async () => {
            mockRequest.body = { invalid: 'format' };

            await paymentController.handleWebhook(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Firma inválida',
                message: 'Webhook signature validation failed',
            });
        });

        it('should handle webhook processing errors', async () => {
            const error = new Error('Processing failed');
            mockWebhookService.validateSignature.mockReturnValue(true);
            mockWebhookService.processWebhookEvent.mockRejectedValue(error);

            await paymentController.handleWebhook(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Error interno',
                message: 'Error processing webhook - will retry',
            });
        });

        it('should process webhook without signature in development', async () => {
            mockRequest.headers = {}; // No signature
            mockWebhookService.processWebhookEvent.mockResolvedValue();

            await paymentController.handleWebhook(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockWebhookService.validateSignature).not.toHaveBeenCalled();
            expect(mockWebhookService.processWebhookEvent).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getPaymentHistory', () => {
        it('should get payment history for authenticated user', async () => {
            const mockPayments = [
                {
                    id: 'payment-1',
                    bookingId: 'booking-1',
                    amount: 100,
                    status: 'approved',
                    paymentMethod: 'credit_card',
                    createdAt: new Date(),
                    field: { id: 'field-1', name: 'Cancha 1' },
                },
            ];

            mockRepository.find.mockResolvedValue(mockPayments);

            await paymentController.getPaymentHistory(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                order: { createdAt: 'DESC' },
            });

            expect(mockResponse.json).toHaveBeenCalledWith({
                payments: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'payment-1',
                        amount: 100,
                        status: 'approved',
                    }),
                ]),
            });
        });

        it('should reject unauthenticated requests', async () => {
            mockRequest.user = undefined;

            await paymentController.getPaymentHistory(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('getPaymentStatus', () => {
        beforeEach(() => {
            mockRequest.params = { id: 'payment-123' };
        });

        it('should get payment status successfully', async () => {
            const mockStatus = {
                id: 'payment-123',
                status: 'approved',
                detail: 'Payment approved',
                preferenceId: 'pref-123',
            };

            mockPaymentService.getPaymentStatus.mockResolvedValue(mockStatus);

            await paymentController.getPaymentStatus(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockPaymentService.getPaymentStatus).toHaveBeenCalledWith(
                'payment-123',
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockStatus);
        });

        it('should handle payment status errors', async () => {
            const error = new Error('Payment not found');
            mockPaymentService.getPaymentStatus.mockRejectedValue(error);

            await paymentController.getPaymentStatus(
                mockRequest as Request,
                mockResponse as Response,
                mockNext,
            );

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
