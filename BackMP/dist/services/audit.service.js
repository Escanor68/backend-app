"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = exports.AuditLog = void 0;
const database_1 = require("../config/database");
const security_utils_1 = require("../utils/security.utils");
const typeorm_1 = require("typeorm");
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditLog.prototype, "resource", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "resourceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuditLog.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], AuditLog.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AuditLog.prototype, "sensitiveData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "dataHash", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AuditLog.prototype, "timestamp", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, typeorm_1.Entity)('audit_logs')
], AuditLog);
class AuditService {
    constructor() {
        this.auditRepository = database_1.AppDataSource.getRepository(AuditLog);
    }
    /**
     * Registra un evento de auditoría de forma segura
     */
    async logAuditEvent(entry) {
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
                    ? (0, security_utils_1.maskSensitiveData)(entry.details)
                    : undefined,
                sensitiveData: entry.sensitiveData || false,
                dataHash: entry.details
                    ? (0, security_utils_1.generateDataHash)(entry.details)
                    : undefined,
                timestamp: new Date(),
            });
            await this.auditRepository.save(auditLog);
            console.log(`📋 [AuditService] Evento registrado: ${entry.action} - ${entry.resource}`);
        }
        catch (error) {
            console.error('❌ [AuditService] Error registrando auditoría:', (0, security_utils_1.sanitizeErrorMessage)(error));
            // No re-lanzar para no interrumpir el flujo principal
        }
    }
    /**
     * Registra acceso a pago (PCI DSS requirement)
     */
    async logPaymentAccess(req, paymentId, action, success, details) {
        const requestInfo = (0, security_utils_1.extractRequestInfo)(req);
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
    async logRefundOperation(req, paymentId, action, success, amount, reason) {
        const requestInfo = (0, security_utils_1.extractRequestInfo)(req);
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
                dataHash: (0, security_utils_1.generateDataHash)({ paymentId, amount, reason }),
            },
            sensitiveData: true,
        });
    }
    /**
     * Registra acceso a datos de facturación
     */
    async logInvoiceAccess(req, paymentId, action, success, invoiceNumber) {
        const requestInfo = (0, security_utils_1.extractRequestInfo)(req);
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
                dataHash: (0, security_utils_1.generateDataHash)({ paymentId, invoiceNumber }),
            },
            sensitiveData: false,
        });
    }
    /**
     * Registra eventos de autenticación
     */
    async logAuthEvent(req, action, success, userId, reason) {
        const requestInfo = (0, security_utils_1.extractRequestInfo)(req);
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
    async logWebhookEvent(ip, eventType, success, dataId, signatureValid) {
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
                    ? (0, security_utils_1.generateDataHash)({ dataId, eventType })
                    : null,
            },
            sensitiveData: true,
        });
    }
    /**
     * Obtiene logs de auditoría con filtros de seguridad
     */
    async getAuditLogs(filters) {
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
    async generateComplianceReport(startDate, endDate) {
        const logs = await this.getAuditLogs({
            startDate,
            endDate,
            limit: 10000,
        });
        return {
            totalEvents: logs.length,
            paymentAccesses: logs.filter((log) => log.action.startsWith('payment.')).length,
            failedAuthentications: logs.filter((log) => log.action.startsWith('auth.') && !log.success).length,
            refundOperations: logs.filter((log) => log.action.startsWith('refund.')).length,
            webhookEvents: logs.filter((log) => log.action.startsWith('webhook.')).length,
            suspiciousActivities: logs.filter((log) => !log.success &&
                ['payment.access', 'auth.login'].includes(log.action)).length,
        };
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map