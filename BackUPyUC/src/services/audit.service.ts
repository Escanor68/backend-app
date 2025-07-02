import { AppDataSource } from '../config/database';
import { AuditLog } from '../models/audit-log.model';
import { Request } from 'express';

export class AuditService {
    private auditLogRepository = AppDataSource.getRepository(AuditLog);

    async logAction(
        userId: string,
        action: string,
        resource: string,
        resourceId: string | null,
        req: Request,
        success: boolean,
        details: any
    ): Promise<void> {
        try {
            const auditLog = this.auditLogRepository.create({
                userId,
                action,
                resource,
                resourceId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent') || '',
                success,
                details: JSON.stringify(details),
                timestamp: new Date(),
            });

            await this.auditLogRepository.save(auditLog);
        } catch (error) {
            console.error('Error logging audit action:', error);
        }
    }

    async getAuditLogs(
        userId?: string,
        resource?: string,
        action?: string,
        limit: number = 100,
        offset: number = 0
    ): Promise<AuditLog[]> {
        const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

        if (userId) {
            queryBuilder.andWhere('audit.userId = :userId', { userId });
        }

        if (resource) {
            queryBuilder.andWhere('audit.resource = :resource', { resource });
        }

        if (action) {
            queryBuilder.andWhere('audit.action = :action', { action });
        }

        return queryBuilder
            .orderBy('audit.timestamp', 'DESC')
            .limit(limit)
            .offset(offset)
            .getMany();
    }
}
