import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../core/errors/api.error';
import { HttpStatus } from '../core/constants';

export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }

            const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

            if (!hasRole) {
                throw new ApiError('No tiene permisos para esta acción', HttpStatus.FORBIDDEN);
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
