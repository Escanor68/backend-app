import { AuditService, AuditLog } from '../../../src/services/audit.service';
import { AppDataSource } from '../../../src/config/database';
import { Request } from 'express';

jest.mock('../../../src/config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('../../../src/utils/security.utils', () => ({
    maskSensitiveData: jest.fn((data) => ({ ...data, masked: true })),
    generateDataHash: jest.fn(() => 'secure-hash-123'),
    extractRequestInfo: jest.fn(() => ({
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: new Date('2023-01-01T00:00:00Z'),
    })),
    sanitizeErrorMessage: jest.fn((error) => error.message),
}));

describe('AuditService', () => {
    let auditService: AuditService;
    let mockRepository: any;
    let mockRequest: Partial<Request>;

    beforeEach(() => {
        mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
                getCount: jest.fn().mockResolvedValue(0),
            })),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(
            mockRepository,
        );
        auditService = new AuditService();

        mockRequest = {
            ip: '127.0.0.1',
            headers: { 'user-agent': 'test-agent' },
            user: { id: 'user-123' },
            path: '/test',
            method: 'POST',
        } as any;

        jest.clearAllMocks();
    });

    describe('logPaymentAccess', () => {
        it('should log payment access successfully', async () => {
            const mockAuditLog = { id: 'audit-123' };
            mockRepository.create.mockReturnValue(mockAuditLog);
            mockRepository.save.mockResolvedValue(mockAuditLog);

            await auditService.logPaymentAccess(
                mockRequest as Request,
                'payment-123',
                'view',
                true,
                { amount: 100 },
            );

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'user-123',
                action: 'payment.view',
                resource: 'payment',
                resourceId: 'payment-123',
                ip: '127.0.0.1',
                userAgent: 'test-agent',
                success: true,
                details: expect.objectContaining({ masked: true }),
                sensitiveData: true,
                dataHash: 'secure-hash-123',
                timestamp: expect.any(Date),
            });

            expect(mockRepository.save).toHaveBeenCalledWith(mockAuditLog);
        });

        it('should handle missing user in request', async () => {
            const requestWithoutUser = { ...mockRequest, user: undefined };
            const mockAuditLog = { id: 'audit-123' };
            mockRepository.create.mockReturnValue(mockAuditLog);
            mockRepository.save.mockResolvedValue(mockAuditLog);

            await auditService.logPaymentAccess(
                requestWithoutUser as Request,
                'payment-123',
                'view',
                false,
            );

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'anonymous',
                action: 'payment.view',
                resource: 'payment',
                resourceId: 'payment-123',
                ip: '127.0.0.1',
                userAgent: 'test-agent',
                success: false,
                details: undefined,
                sensitiveData: true,
                dataHash: undefined,
                timestamp: expect.any(Date),
            });
        });
    });

    describe('logRefundOperation', () => {
        it('should log refund operation with all parameters', async () => {
            const mockAuditLog = { id: 'audit-123' };
            mockRepository.create.mockReturnValue(mockAuditLog);
            mockRepository.save.mockResolvedValue(mockAuditLog);

            await auditService.logRefundOperation(
                mockRequest as Request,
                'payment-123',
                'request',
                true,
                100,
                'Customer request',
            );

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'user-123',
                action: 'refund.request',
                resource: 'refund',
                resourceId: 'payment-123',
                ip: '127.0.0.1',
                userAgent: 'test-agent',
                success: true,
                details: expect.objectContaining({
                    amount: 100,
                    reason: 'Customer request',
                    dataHash: 'secure-hash-123',
                    masked: true,
                }),
                sensitiveData: true,
                dataHash: 'secure-hash-123',
                timestamp: expect.any(Date),
            });
        });

        it('should log refund operation without optional parameters', async () => {
            const mockAuditLog = { id: 'audit-123' };
            mockRepository.create.mockReturnValue(mockAuditLog);
            mockRepository.save.mockResolvedValue(mockAuditLog);

            await auditService.logRefundOperation(
                mockRequest as Request,
                'payment-123',
                'status',
                true,
            );

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'user-123',
                action: 'refund.status',
                resource: 'refund',
                resourceId: 'payment-123',
                ip: '127.0.0.1',
                userAgent: 'test-agent',
                success: true,
                details: expect.objectContaining({
                    amount: undefined,
                    reason: undefined,
                    dataHash: 'secure-hash-123',
                    masked: true,
                }),
                sensitiveData: true,
                dataHash: 'secure-hash-123',
                timestamp: expect.any(Date),
            });
        });
    });

    describe('logAuthEvent', () => {
        it('should log authentication event successfully', async () => {
            const mockAuditLog = { id: 'audit-123' };
            mockRepository.create.mockReturnValue(mockAuditLog);
            mockRepository.save.mockResolvedValue(mockAuditLog);

            await auditService.logAuthEvent(
                mockRequest as Request,
                'login',
                true,
                'user-123',
                'google',
            );

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'user-123',
                action: 'auth.login',
                resource: 'authentication',
                resourceId: undefined,
                ip: '127.0.0.1',
                userAgent: 'test-agent',
                success: true,
                details: expect.objectContaining({
                    reason: 'google',
                    masked: true,
                }),
                sensitiveData: false,
                dataHash: 'secure-hash-123',
                timestamp: expect.any(Date),
            });
        });
    });

    describe('logWebhookEvent', () => {
        it('should log webhook event successfully', async () => {
            const mockAuditLog = { id: 'audit-123' };
            mockRepository.create.mockReturnValue(mockAuditLog);
            mockRepository.save.mockResolvedValue(mockAuditLog);

            await auditService.logWebhookEvent(
                '127.0.0.1',
                'payment',
                true,
                'mp-payment-123',
                true,
            );

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'webhook',
                action: 'webhook.payment',
                resource: 'webhook',
                resourceId: 'mp-payment-123',
                ip: '127.0.0.1',
                userAgent: 'MercadoPago-Webhook',
                success: true,
                details: expect.objectContaining({
                    eventType: 'payment',
                    signatureValid: true,
                    masked: true,
                }),
                sensitiveData: true,
                dataHash: 'secure-hash-123',
                timestamp: expect.any(Date),
            });
        });
    });

    describe('getAuditLogs', () => {
        it('should get audit logs with filters', async () => {
            const mockLogs = [
                { id: 'audit-1', action: 'payment.view' },
                { id: 'audit-2', action: 'refund.request' },
            ];

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockLogs),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const filters = {
                userId: 'user-123',
                action: 'payment.view',
                resource: 'payment',
                startDate: new Date('2023-01-01'),
                endDate: new Date('2023-12-31'),
                limit: 50,
            };

            const result = await auditService.getAuditLogs(filters);

            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
                'audit',
            );
            expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
                'audit.timestamp',
                'DESC',
            );
            expect(mockQueryBuilder.limit).toHaveBeenCalledWith(50);
            expect(result).toEqual(mockLogs);
        });

        it('should get audit logs without filters', async () => {
            const mockLogs = [{ id: 'audit-1' }];

            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockLogs),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await auditService.getAuditLogs({});

            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
                'audit',
            );
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
                'audit.timestamp',
                'DESC',
            );
            expect(mockQueryBuilder.limit).toHaveBeenCalledWith(100);
            expect(result).toEqual(mockLogs);
        });
    });

    describe('generateComplianceReport', () => {
        it('should generate compliance report', async () => {
            mockRepository.count.mockResolvedValueOnce(50); // total events
            mockRepository.count.mockResolvedValueOnce(25); // payment accesses
            mockRepository.count.mockResolvedValueOnce(5); // failed auth
            mockRepository.count.mockResolvedValueOnce(15); // refund ops
            mockRepository.count.mockResolvedValueOnce(10); // webhook events
            mockRepository.count.mockResolvedValueOnce(2); // suspicious

            const startDate = new Date('2023-01-01');
            const endDate = new Date('2023-12-31');

            const result = await auditService.generateComplianceReport(
                startDate,
                endDate,
            );

            expect(result).toEqual({
                totalEvents: 50,
                paymentAccesses: 25,
                failedAuthentications: 5,
                refundOperations: 15,
                webhookEvents: 10,
                suspiciousActivities: 2,
            });
        });
    });

    describe('logAuditEvent', () => {
        it('should log audit event with all details', async () => {
            const mockAuditLog = { id: 'audit-123' };
            mockRepository.create.mockReturnValue(mockAuditLog);
            mockRepository.save.mockResolvedValue(mockAuditLog);

            const auditEntry = {
                timestamp: '2023-01-01T00:00:00.000Z',
                userId: 'user-123',
                action: 'custom_action',
                resource: 'custom_resource',
                resourceId: 'resource-123',
                ip: '192.168.1.1',
                userAgent: 'custom-agent',
                success: true,
                details: { custom: 'data' },
                sensitiveData: true,
            };

            await auditService.logAuditEvent(auditEntry);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'user-123',
                action: 'custom_action',
                resource: 'custom_resource',
                resourceId: 'resource-123',
                ip: '192.168.1.1',
                userAgent: 'custom-agent',
                success: true,
                details: expect.objectContaining({ masked: true }),
                sensitiveData: true,
                dataHash: 'secure-hash-123',
                timestamp: expect.any(Date),
            });
        });

        it('should handle missing optional fields', async () => {
            const mockAuditLog = { id: 'audit-123' };
            mockRepository.create.mockReturnValue(mockAuditLog);
            mockRepository.save.mockResolvedValue(mockAuditLog);

            const auditEntry = {
                timestamp: '2023-01-01T00:00:00.000Z',
                userId: undefined,
                action: 'minimal_action',
                resource: 'minimal_resource',
                success: false,
            };

            await auditService.logAuditEvent(auditEntry);

            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'anonymous',
                action: 'minimal_action',
                resource: 'minimal_resource',
                resourceId: undefined,
                ip: 'unknown',
                userAgent: 'unknown',
                success: false,
                details: undefined,
                sensitiveData: false,
                dataHash: undefined,
                timestamp: expect.any(Date),
            });
        });
    });

    describe('error handling', () => {
        it('should handle database errors gracefully', async () => {
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            // Should not throw
            await expect(
                auditService.logPaymentAccess(
                    mockRequest as Request,
                    'payment-123',
                    'view',
                    true,
                ),
            ).resolves.not.toThrow();
        });

        it('should handle repository creation errors', async () => {
            mockRepository.create.mockImplementation(() => {
                throw new Error('Creation error');
            });

            await expect(
                auditService.logAuditEvent({
                    timestamp: '2023-01-01T00:00:00.000Z',
                    userId: 'user-123',
                    action: 'test',
                    resource: 'test',
                    success: true,
                }),
            ).resolves.not.toThrow();
        });
    });
});
