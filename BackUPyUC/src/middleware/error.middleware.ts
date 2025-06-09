import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../core/errors/api.error';
import { HttpStatus } from '../core/constants';

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', error);

    if (error instanceof ApiError) {
        res.status(error.statusCode).json({
            message: error.message,
            code: error.statusCode,
        });
        return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error interno del servidor',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
    });
};
