import crypto from 'crypto';
import { Request } from 'express';

/**
 * Utilities para cumplir con PCI DSS
 */

export interface SensitiveDataMaskConfig {
    cardNumber?: boolean;
    cvv?: boolean;
    expirationDate?: boolean;
    email?: boolean;
    phone?: boolean;
}

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

/**
 * Enmascara datos sensibles para logs seguros
 */
export function maskSensitiveData(
    data: any,
    config: SensitiveDataMaskConfig = {},
): any {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const masked = { ...data };
    const defaultConfig: SensitiveDataMaskConfig = {
        cardNumber: true,
        cvv: true,
        expirationDate: true,
        email: false,
        phone: true,
        ...config,
    };

    // Mascarar número de tarjeta
    if (defaultConfig.cardNumber && masked.cardNumber) {
        const cardNumber = String(masked.cardNumber).replace(/\s/g, '');
        if (cardNumber.length >= 6) {
            masked.cardNumber = `****-****-****-${cardNumber.slice(-4)}`;
        } else {
            masked.cardNumber = '****-****-****-****';
        }
    }

    // Mascarar CVV (nunca debe aparecer en logs)
    if (defaultConfig.cvv && masked.cvv) {
        masked.cvv = '***';
    }

    // Mascarar fecha de expiración
    if (defaultConfig.expirationDate && masked.expirationDate) {
        masked.expirationDate = '**/**';
    }

    // Mascarar email parcialmente
    if (defaultConfig.email && masked.email) {
        const email = String(masked.email);
        const [user, domain] = email.split('@');
        if (user && domain) {
            const maskedUser =
                user.length > 2
                    ? user.substring(0, 2) + '*'.repeat(user.length - 2)
                    : '**';
            masked.email = `${maskedUser}@${domain}`;
        }
    }

    // Mascarar teléfono
    if (defaultConfig.phone && masked.phone) {
        const phone = String(masked.phone).replace(/\D/g, '');
        if (phone.length >= 4) {
            masked.phone = `***-***-${phone.slice(-4)}`;
        } else {
            masked.phone = '***-***-****';
        }
    }

    // Buscar recursivamente en objetos anidados
    Object.keys(masked).forEach((key) => {
        if (
            typeof masked[key] === 'object' &&
            masked[key] !== null &&
            !Array.isArray(masked[key])
        ) {
            masked[key] = maskSensitiveData(masked[key], config);
        } else if (Array.isArray(masked[key])) {
            masked[key] = masked[key].map((item: any) =>
                typeof item === 'object'
                    ? maskSensitiveData(item, config)
                    : item,
            );
        }
    });

    return masked;
}

/**
 * Genera hash para auditoría sin exponer datos sensibles
 */
export function generateDataHash(data: any): string {
    const sensitiveKeys = ['cardNumber', 'cvv', 'password', 'token', 'secret'];
    const sanitizedData = { ...data };

    // Remover datos sensibles antes de hacer hash
    Object.keys(sanitizedData).forEach((key) => {
        if (
            sensitiveKeys.some((sensitive) =>
                key.toLowerCase().includes(sensitive),
            )
        ) {
            delete sanitizedData[key];
        }
    });

    return crypto
        .createHash('sha256')
        .update(JSON.stringify(sanitizedData))
        .digest('hex')
        .substring(0, 16); // Solo primeros 16 caracteres para logs
}

/**
 * Extrae información segura del request para auditoría
 */
export function extractRequestInfo(req: Request): {
    ip: string;
    userAgent: string;
    method: string;
    path: string;
    timestamp: string;
} {
    return {
        ip: getClientIP(req),
        userAgent: (req.get('User-Agent') || 'Unknown').substring(0, 200),
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Obtiene la IP real del cliente considerando proxies
 */
export function getClientIP(req: Request): string {
    const forwarded = req.get('X-Forwarded-For');
    const realIP = req.get('X-Real-IP');
    const clientIP = req.connection.remoteAddress;

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    return clientIP || 'unknown';
}

/**
 * Valida si una IP está en la whitelist
 */
export function isIPWhitelisted(ip: string, whitelist: string[] = []): boolean {
    if (whitelist.length === 0) {
        return true; // Si no hay whitelist, permitir todas
    }

    // Permitir localhost en desarrollo
    const localhostIPs = ['127.0.0.1', '::1', 'localhost'];
    if (process.env.NODE_ENV === 'development' && localhostIPs.includes(ip)) {
        return true;
    }

    return whitelist.includes(ip);
}

/**
 * Genera token seguro para operaciones sensibles
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Valida fortaleza de token/secreto
 */
export function validateSecurityToken(token: string): {
    isValid: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];

    if (token.length < 32) {
        reasons.push('Token muy corto (mínimo 32 caracteres)');
    }

    if (!/[a-z]/.test(token)) {
        reasons.push('Token debe contener letras minúsculas');
    }

    if (!/[A-Z]/.test(token)) {
        reasons.push('Token debe contener letras mayúsculas');
    }

    if (!/[0-9]/.test(token)) {
        reasons.push('Token debe contener números');
    }

    const commonPatterns = ['123456', 'password', 'secret', 'token'];
    if (
        commonPatterns.some((pattern) => token.toLowerCase().includes(pattern))
    ) {
        reasons.push('Token contiene patrones comunes inseguros');
    }

    return {
        isValid: reasons.length === 0,
        reasons,
    };
}

/**
 * Redacta datos sensibles de error messages
 */
export function sanitizeErrorMessage(error: any): string {
    let message = String(error.message || error);

    // Patterns comunes de datos sensibles en errores
    const sensitivePatterns = [
        /\b\d{13,19}\b/g, // Números de tarjeta
        /\b\d{3,4}\b/g, // CVV
        /password[:\s]*[^\s]+/gi, // Passwords
        /token[:\s]*[^\s]+/gi, // Tokens
        /secret[:\s]*[^\s]+/gi, // Secrets
    ];

    sensitivePatterns.forEach((pattern) => {
        message = message.replace(pattern, '[REDACTED]');
    });

    return message;
}

