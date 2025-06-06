import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../api/services/auth.service';
import { ApiError } from '../api/utils/api-error';
import { HttpStatus } from '../api/utils/http-status';

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
            roles: user.roles,
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError('Error de autenticación', HttpStatus.UNAUTHORIZED));
        }
    }
};
