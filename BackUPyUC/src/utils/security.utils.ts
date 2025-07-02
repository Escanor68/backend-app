import crypto from 'crypto';

/**
 * Enmascara datos sensibles en logs y respuestas
 */
export function maskSensitiveData(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
        // Enmascarar emails
        if (data.includes('@')) {
            const [local, domain] = data.split('@');
            const maskedLocal =
                local.length > 2 ? local.substring(0, 2) + '*'.repeat(local.length - 2) : '**';
            return `${maskedLocal}@${domain}`;
        }

        // Enmascarar contraseñas y tokens
        if (data.length > 8) {
            return (
                data.substring(0, 4) + '*'.repeat(data.length - 8) + data.substring(data.length - 4)
            );
        }

        return '*'.repeat(data.length);
    }

    if (typeof data === 'object') {
        const masked: any = Array.isArray(data) ? [] : {};

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null) {
                masked[key] = maskSensitiveData(value);
            } else if (isSensitiveField(key)) {
                masked[key] = maskSensitiveData(value);
            } else {
                masked[key] = value;
            }
        }

        return masked;
    }

    return data;
}

/**
 * Verifica si un campo es sensible y debe ser enmascarado
 */
function isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
        'password',
        'token',
        'secret',
        'key',
        'auth',
        'credential',
        'pin',
        'ssn',
        'creditCard',
        'cardNumber',
        'cvv',
        'email',
    ];

    return sensitiveFields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()));
}

/**
 * Extrae información de la request para auditoría
 */
export function extractRequestInfo(req: any): {
    ip: string;
    userAgent: string;
    method: string;
    path: string;
    headers: any;
} {
    return {
        ip: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        method: req.method || 'unknown',
        path: req.path || req.url || 'unknown',
        headers: maskSensitiveData(req.headers),
    };
}

/**
 * Genera un hash de datos para auditoría
 */
export function generateDataHash(data: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Sanitiza mensajes de error para no exponer información sensible
 */
export function sanitizeErrorMessage(error: any): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error?.message) {
        // Remover información sensible de mensajes de error
        let message = error.message;

        // Remover stack traces
        if (message.includes('at ')) {
            message = message.split('at ')[0];
        }

        // Remover rutas de archivo
        message = message.replace(/\/[\/\w\-\.]+\.(ts|js):\d+:\d+/g, '');

        // Remover información de base de datos
        message = message.replace(/SQLSTATE\[\d+\]/g, 'Database Error');

        return message.trim();
    }

    return 'Error interno del servidor';
}

/**
 * Interfaz para entradas de auditoría
 */
export interface AuditLogEntry {
    timestamp: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ip?: string;
    userAgent?: string;
    success: boolean;
    details?: any;
    sensitiveData?: boolean;
}
