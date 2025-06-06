import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../api/utils/api-error';
import { HttpStatus } from '../api/utils/http-status';

export const errorHandler = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', error);

    if (error instanceof ApiError) {
        res.status(error.statusCode).json({
            status: 'error',
            code: error.statusCode,
            message: error.message,
            timestamp: new Date().toISOString(),
        });
        return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString(),
    });
};
