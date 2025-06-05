import { AppDataSource } from '../config/database';
import {
    maskSensitiveData,
    extractRequestInfo,
    generateDataHash,
    sanitizeErrorMessage,
    AuditLogEntry,
} from '../utils/security.utils';
import { Request } from 'express';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    action: string;

    @Column()
    resource: string;

    @Column({ nullable: true })
    resourceId: string;

    @Column()
    ip: string;

    @Column({ type: 'text' })
    userAgent: string;

    @Column()
    success: boolean;

    @Column({ type: 'json', nullable: true })
    details: any;

    @Column({ default: false })
    sensitiveData: boolean;

    @Column({ nullable: true })
    dataHash: string;

    @CreateDateColumn()
    timestamp: Date;
}

export class AuditService {
    private auditRepository = AppDataSource.getRepository(AuditLog);

    /**
     * Registra un evento de auditoría de forma segura
     */
    async logAuditEvent(entry: AuditLogEntry): Promise<void> {
        try {
            const auditLog = this.auditRepository.create({
                userId: entry.userId || 'anonymous',
                action: entry.action,
                resource: entry.resource,
                resourceId: entry.resourceId || undefined,
                ip: entry.ip || 'unknown',
                userAgent: entry.userAgent || 'unknown',
                success: entry.success,
                details: entry.details
                    ? maskSensitiveData(entry.details)
                    : undefined,
                sensitiveData: entry.sensitiveData || false,
                dataHash: entry.details
                    ? generateDataHash(entry.details)
                    : undefined,
                timestamp: new Date(),
            });

            await this.auditRepository.save(auditLog);

            console.log(
                `📋 [AuditService] Evento registrado: ${entry.action} - ${entry.resource}`,
            );
        } catch (error) {
            console.error(
                '❌ [AuditService] Error registrando auditoría:',
                sanitizeErrorMessage(error),
            );
            // No re-lanzar para no interrumpir el flujo principal
        }
    }

    /**
     * Registra acceso a pago (PCI DSS requirement)
     */
    async logPaymentAccess(
        req: Request,
        paymentId: string,
        action: string,
        success: boolean,
        details?: any,
    ): Promise<void> {
        const requestInfo = extractRequestInfo(req);

        await this.logAuditEvent({
            timestamp: requestInfo.timestamp,
            userId: req.user?.id,
            action: `payment.${action}`,
            resource: 'payment',
            resourceId: paymentId,
            ip: requestInfo.ip,
            userAgent: requestInfo.userAgent,
            success,
            details,
            sensitiveData: true,
        });
    }

    /**
     * Registra operación de reembolso
     */
    async logRefundOperation(
        req: Request,
        paymentId: string,
        action: string,
        success: boolean,
        amount?: number,
        reason?: string,
    ): Promise<void> {
        const requestInfo = extractRequestInfo(req);

        await this.logAuditEvent({
            timestamp: requestInfo.timestamp,
            userId: req.user?.id,
            action: `refund.${action}`,
            resource: 'refund',
            resourceId: paymentId,
            ip: requestInfo.ip,
            userAgent: requestInfo.userAgent,
            success,
            details: {
                amount,
                reason,
                dataHash: generateDataHash({ paymentId, amount, reason }),
            },
            sensitiveData: true,
        });
    }

    /**
     * Registra acceso a datos de facturación
     */
    async logInvoiceAccess(
        req: Request,
        paymentId: string,
        action: string,
        success: boolean,
        invoiceNumber?: string,
    ): Promise<void> {
        const requestInfo = extractRequestInfo(req);

        await this.logAuditEvent({
            timestamp: requestInfo.timestamp,
            userId: req.user?.id,
            action: `invoice.${action}`,
            resource: 'invoice',
            resourceId: paymentId,
            ip: requestInfo.ip,
            userAgent: requestInfo.userAgent,
            success,
            details: {
                invoiceNumber,
                dataHash: generateDataHash({ paymentId, invoiceNumber }),
            },
            sensitiveData: false,
        });
    }

    /**
     * Registra eventos de autenticación
     */
    async logAuthEvent(
        req: Request,
        action: string,
        success: boolean,
        userId?: string,
        reason?: string,
    ): Promise<void> {
        const requestInfo = extractRequestInfo(req);

        await this.logAuditEvent({
            timestamp: requestInfo.timestamp,
            userId: userId || 'anonymous',
            action: `auth.${action}`,
            resource: 'authentication',
            ip: requestInfo.ip,
            userAgent: requestInfo.userAgent,
            success,
            details: {
                reason,
                endpoint: req.path,
            },
            sensitiveData: false,
        });
    }

    /**
     * Registra webhook recibido (importante para PCI DSS)
     */
    async logWebhookEvent(
        ip: string,
        eventType: string,
        success: boolean,
        dataId?: string,
        signatureValid?: boolean,
    ): Promise<void> {
        await this.logAuditEvent({
            timestamp: new Date().toISOString(),
            userId: 'webhook',
            action: `webhook.${eventType}`,
            resource: 'webhook',
            resourceId: dataId,
            ip,
            userAgent: 'MercadoPago-Webhook',
            success,
            details: {
                eventType,
                signatureValid,
                dataHash: dataId
                    ? generateDataHash({ dataId, eventType })
                    : null,
            },
            sensitiveData: true,
        });
    }

    /**
     * Obtiene logs de auditoría con filtros de seguridad
     */
    async getAuditLogs(filters: {
        userId?: string;
        action?: string;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<AuditLog[]> {
        const query = this.auditRepository.createQueryBuilder('audit');

        if (filters.userId) {
            query.andWhere('audit.userId = :userId', {
                userId: filters.userId,
            });
        }

        if (filters.action) {
            query.andWhere('audit.action LIKE :action', {
                action: `%${filters.action}%`,
            });
        }

        if (filters.resource) {
            query.andWhere('audit.resource = :resource', {
                resource: filters.resource,
            });
        }

        if (filters.startDate) {
            query.andWhere('audit.timestamp >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters.endDate) {
            query.andWhere('audit.timestamp <= :endDate', {
                endDate: filters.endDate,
            });
        }

        query.orderBy('audit.timestamp', 'DESC');
        query.limit(filters.limit || 100);

        return await query.getMany();
    }

    /**
     * Genera reporte de auditoría para compliance
     */
    async generateComplianceReport(
        startDate: Date,
        endDate: Date,
    ): Promise<{
        totalEvents: number;
        paymentAccesses: number;
        failedAuthentications: number;
        refundOperations: number;
        webhookEvents: number;
        suspiciousActivities: number;
    }> {
        const logs = await this.getAuditLogs({
            startDate,
            endDate,
            limit: 10000,
        });

        return {
            totalEvents: logs.length,
            paymentAccesses: logs.filter((log) =>
                log.action.startsWith('payment.'),
            ).length,
            failedAuthentications: logs.filter(
                (log) => log.action.startsWith('auth.') && !log.success,
            ).length,
            refundOperations: logs.filter((log) =>
                log.action.startsWith('refund.'),
            ).length,
            webhookEvents: logs.filter((log) =>
                log.action.startsWith('webhook.'),
            ).length,
            suspiciousActivities: logs.filter(
                (log) =>
                    !log.success &&
                    ['payment.access', 'auth.login'].includes(log.action),
            ).length,
        };
    }
}
