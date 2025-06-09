import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';

export const errorHandler = (
    err: Error | ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('⚠️ [BackUPyUC] Error en la aplicación:', err);

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            error: err.name,
            message: err.message,
        });
        return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: err.message || 'Ha ocurrido un error inesperado',
    });
};
