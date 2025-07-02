import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';

export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }

            const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

            if (!hasRole) {
                throw new ApiError(HttpStatus.FORBIDDEN, 'No tiene permisos para esta acción');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const requireAdmin = roleMiddleware(['admin']);
export const requireManager = roleMiddleware(['admin', 'manager']);
export const requireUser = roleMiddleware(['admin', 'manager', 'user']);
