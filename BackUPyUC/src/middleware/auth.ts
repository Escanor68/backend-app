import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { AuthenticatedUser, UserRole } from '../types/user.types';

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

export const authMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new ApiError('No se proporcionó token de autenticación', HttpStatus.UNAUTHORIZED);
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new ApiError('Formato de token inválido', HttpStatus.UNAUTHORIZED);
        }

        const authService = new AuthService();
        const user = await authService.validateToken(token);

        req.user = {
            id: user.id,
            email: user.email,
            roles: user.roles.map(r => r as UserRole),
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
            return;
        }
        next(new ApiError('Error de autenticación', HttpStatus.UNAUTHORIZED));
    }
};

export const roleMiddleware = (roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }

            const hasRole = roles.some(role => req.user?.roles.includes(role as UserRole));
            if (!hasRole) {
                throw new ApiError(
                    'No tiene permisos para acceder a este recurso',
                    HttpStatus.FORBIDDEN
                );
            }

            next();
        } catch (error) {
            if (error instanceof ApiError) {
                next(error);
                return;
            }
            next(new ApiError('Error de autorización', HttpStatus.FORBIDDEN));
        }
    };
};
