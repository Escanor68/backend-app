import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    status?: number;
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    error: CustomError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.error('❌ [ErrorHandler] Error interceptado:', error);
    console.error('❌ [ErrorHandler] Stack trace:', error.stack);
    console.error('❌ [ErrorHandler] Request path:', req.path);
    console.error('❌ [ErrorHandler] Request method:', req.method);
    console.error('❌ [ErrorHandler] Request IP:', req.ip);

    // Error de validación
    if (error.name === 'ValidationError') {
        console.log('⚠️ [ErrorHandler] Error de validación detectado');
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'Error de validación',
            details: error.message,
            timestamp: new Date().toISOString(),
        });
    }

    // Error de JWT
    if (error.name === 'JsonWebTokenError') {
        console.log('🔐 [ErrorHandler] Error de JWT detectado');
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Token inválido',
            timestamp: new Date().toISOString(),
        });
    }

    // Error de JWT expirado
    if (error.name === 'TokenExpiredError') {
        console.log('🔐 [ErrorHandler] Token expirado detectado');
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'Token expirado',
            timestamp: new Date().toISOString(),
        });
    }

    // Error de base de datos
    if (error.code === '23505') {
        // Duplicate key error
        console.log(
            '📦 [ErrorHandler] Error de clave duplicada en base de datos',
        );
        return res.status(409).json({
            status: 'error',
            code: 409,
            message: 'Ya existe un registro con esos datos',
            timestamp: new Date().toISOString(),
        });
    }

    // Error con status personalizado
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || 'Error interno del servidor';

    console.log(`🔧 [ErrorHandler] Enviando response con status ${statusCode}`);

    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
