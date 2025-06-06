import { AppDataSource } from '../../config/database';
import { AuditLog } from '../../models/audit-log.model';
import { Request } from 'express';
import { maskSensitiveData } from '../../utils/security.utils';
import crypto from 'crypto';

export class AuditService {
    private auditRepository = AppDataSource.getRepository(AuditLog);

    constructor() {
        console.log('🏗️ [AuditService] Inicializando AuditService...');
        console.log('✅ [AuditService] AuditService inicializado correctamente');
    }

    async logAction(
        userId: string,
        action: string,
        resource: string,
        resourceId: string | null,
        req: Request,
        success: boolean,
        details?: any
    ): Promise<void> {
        try {
            const auditLog = this.auditRepository.create({
                userId: userId,
                action: action,
                resource: resource,
                resourceId: resourceId || null,
                ip: req.ip,
                userAgent: req.headers['user-agent'] || 'unknown',
                success: success,
                details: details ? maskSensitiveData(details) : null,
                sensitiveData: !!details,
                dataHash: details ? this.generateDataHash(details) : null,
            } as Partial<AuditLog>);

            await this.auditRepository.save(auditLog);
        } catch (error) {
            console.error('Error al registrar acción en auditoría:', error);
            // No lanzamos el error para no interrumpir el flujo principal
        }
    }

    async getUserAuditLogs(
        userId: string,
        page = 1,
        limit = 10
    ): Promise<{ logs: AuditLog[]; total: number }> {
        const [logs, total] = await this.auditRepository.findAndCount({
            where: { userId },
            order: { timestamp: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { logs, total };
    }

    async getResourceAuditLogs(
        resource: string,
        resourceId: string,
        page = 1,
        limit = 10
    ): Promise<{ logs: AuditLog[]; total: number }> {
        const [logs, total] = await this.auditRepository.findAndCount({
            where: { resource, resourceId },
            order: { timestamp: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { logs, total };
    }

    private generateDataHash(data: any): string {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }
}
