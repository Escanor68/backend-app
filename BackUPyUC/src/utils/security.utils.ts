import crypto from 'crypto';

export const maskSensitiveData = (data: any): any => {
    if (!data) return data;

    const sensitiveFields = [
        'password',
        'token',
        'secret',
        'apiKey',
        'accessToken',
        'refreshToken',
    ];
    const masked = { ...data };

    for (const field of sensitiveFields) {
        if (field in masked) {
            masked[field] = '********';
        }
    }

    return masked;
};

export const extractRequestInfo = (req: any) => {
    return {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: req.path,
        query: req.query,
        body: maskSensitiveData(req.body),
    };
};

export const generateDataHash = (data: any): string => {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex');
};

export const sanitizeErrorMessage = (error: any): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};
