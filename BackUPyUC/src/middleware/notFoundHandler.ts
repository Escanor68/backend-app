import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
    next(new ApiError('La ruta solicitada no existe', HttpStatus.NOT_FOUND));
};
