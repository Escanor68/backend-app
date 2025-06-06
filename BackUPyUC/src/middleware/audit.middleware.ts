import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../api/services/audit.service';

export const auditMiddleware = (action: string, resource: string) => {
    const auditService = new AuditService();

    return async (req: Request, res: Response, next: NextFunction) => {
        const originalSend = res.send;
        let responseBody: any;

        // Interceptar la respuesta
        res.send = function (body: any): Response {
            responseBody = body;
            return originalSend.call(this, body);
        };

        try {
            await next();

            // Registrar la acción después de que se complete
            if (req.user?.id) {
                const resourceId = req.params.id || null;
                const success = res.statusCode >= 200 && res.statusCode < 300;

                await auditService.logAction(
                    req.user.id,
                    action,
                    resource,
                    resourceId,
                    req,
                    success,
                    {
                        request: {
                            body: req.body,
                            query: req.query,
                            params: req.params,
                        },
                        response: {
                            statusCode: res.statusCode,
                            body: responseBody,
                        },
                    },
                );
            }
        } catch (error) {
            // Registrar el error si ocurre
            if (req.user?.id) {
                const resourceId = req.params.id || null;
                await auditService.logAction(
                    req.user.id,
                    action,
                    resource,
                    resourceId,
                    req,
                    false,
                    {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                );
            }
            throw error;
        }
    };
};
