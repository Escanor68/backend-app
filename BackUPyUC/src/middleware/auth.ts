import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { AuthenticatedUser, UserRole } from '../types/user.types';

interface JwtPayload {
    userId: string;
}

interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token de autorización requerido');
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        // Buscar el usuario en la base de datos
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: decoded.userId },
            select: ['id', 'email', 'name', 'roles', 'isBlocked'],
        });

        if (!user) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no encontrado');
        }

        if (user.isBlocked) {
            throw new ApiError(HttpStatus.FORBIDDEN, 'Usuario bloqueado');
        }

        const authenticatedUser: AuthenticatedUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
        };

        req.user = authenticatedUser;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError(HttpStatus.UNAUTHORIZED, 'Token inválido'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError(HttpStatus.UNAUTHORIZED, 'Token expirado'));
        } else {
            next(new ApiError(HttpStatus.UNAUTHORIZED, 'Error de autenticación'));
        }
    }
};

export const roleMiddleware = (roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }

            const hasRole = roles.some(role => req.user?.roles.includes(role as UserRole));
            if (!hasRole) {
                throw new ApiError(
                    HttpStatus.FORBIDDEN,
                    'No tiene permisos para acceder a este recurso'
                );
            }

            next();
        } catch (error) {
            if (error instanceof ApiError) {
                next(error);
                return;
            }
            next(new ApiError(HttpStatus.FORBIDDEN, 'Error de autorización'));
        }
    };
};
