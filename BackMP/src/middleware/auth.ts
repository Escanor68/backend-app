import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                roles: string[];
            }
        }
    }
}

export const authenticate = (requiredRoles: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    status: 'error',
                    message: 'No se proporcionó token de autenticación'
                });
            }

            if (!authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Formato de token inválido'
                });
            }

            const token = authHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(token, config.jwt.secret) as {
                    sub: string;
                    email: string;
                    roles: string[];
                    exp: number;
                };

                const currentTimestamp = Math.floor(Date.now() / 1000);
                if (decoded.exp < currentTimestamp) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Token expirado'
                    });
                }

                if (requiredRoles.length > 0) {
                    const hasRequiredRole = requiredRoles.some(role => 
                        decoded.roles.includes(role)
                    );

                    if (!hasRequiredRole) {
                        return res.status(403).json({
                            status: 'error',
                            message: 'No tienes los permisos necesarios'
                        });
                    }
                }

                req.user = {
                    id: decoded.sub,
                    email: decoded.email,
                    roles: decoded.roles
                };

                next();

            } catch (error) {
                if (error instanceof jwt.JsonWebTokenError) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Token inválido'
                    });
                }

                if (error instanceof jwt.TokenExpiredError) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Token expirado'
                    });
                }

                return res.status(500).json({
                    status: 'error',
                    message: 'Error en la autenticación'
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    };
};

export const requireRole = (role: string) => {
    return authenticate([role]);
};

export const isOwner = (paramIdField: string = 'id') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resourceId = req.params[paramIdField];
            if (req.user?.id !== resourceId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permiso para acceder a este recurso'
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al verificar la propiedad del recurso'
            });
        }
    };
}; 