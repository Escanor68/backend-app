import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../api/utils/api-error';
import { HttpStatus } from '../api/utils/http-status';

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
    next(new ApiError('Ruta no encontrada', HttpStatus.NOT_FOUND));
};
