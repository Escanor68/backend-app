import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'No se proporcionó token de autenticación');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Formato de token inválido');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
                id: number;
                email: string;
                roles: UserRole[];
            };

            req.user = {
                id: decoded.id,
                email: decoded.email,
                roles: decoded.roles,
            };

            next();
        } catch (error) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token inválido o expirado');
        }
    } catch (error) {
        next(error);
    }
};
