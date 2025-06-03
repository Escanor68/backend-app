import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Extender el tipo Request para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                roles: string[];
            };
        }
    }
}

export const authenticate = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('🔐 [Auth] authenticate - Iniciando autenticación...');

            const authHeader = req.headers.authorization;
            console.log(
                '🎫 [Auth] Authorization header presente:',
                !!authHeader,
            );

            if (!authHeader) {
                console.log(
                    '❌ [Auth] No se proporcionó token de autorización',
                );
                return res.status(401).json({
                    message: 'Token de autorización requerido',
                });
            }

            const token = authHeader.split(' ')[1]; // Bearer TOKEN
            if (!token) {
                console.log('❌ [Auth] Formato de token inválido');
                return res.status(401).json({
                    message: 'Formato de token inválido',
                });
            }

            console.log(
                '🎫 [Auth] Token extraído (primeros 20 caracteres):',
                token.substring(0, 20) + '...',
            );

            // Verificar token JWT
            const decoded = jwt.verify(token, config.jwt.secret) as any;
            console.log('✅ [Auth] Token JWT válido');
            console.log('👤 [Auth] Usuario decodificado:', {
                id: decoded.id,
                email: decoded.email,
                roles: decoded.roles,
            });

            // Agregar usuario al request
            req.user = {
                id: decoded.id,
                email: decoded.email,
                roles: decoded.roles || ['user'],
            };

            console.log('✅ [Auth] Usuario autenticado correctamente');
            next();
        } catch (error) {
            console.error('❌ [Auth] Error en autenticación:', error);

            if (error instanceof jwt.JsonWebTokenError) {
                console.log('🔐 [Auth] Token JWT inválido');
                return res.status(401).json({
                    message: 'Token inválido',
                });
            }

            if (error instanceof jwt.TokenExpiredError) {
                console.log('⏰ [Auth] Token JWT expirado');
                return res.status(401).json({
                    message: 'Token expirado',
                });
            }

            console.log('💥 [Auth] Error interno en autenticación');
            return res.status(500).json({
                message: 'Error interno del servidor',
            });
        }
    };
};

export const requireRole = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(
                '🔍 [Auth] requireRole - Verificando rol:',
                requiredRole,
            );

            if (!req.user) {
                console.log(
                    '❌ [Auth] Usuario no autenticado en verificación de rol',
                );
                return res.status(401).json({
                    message: 'Usuario no autenticado',
                });
            }

            console.log('👤 [Auth] Roles del usuario:', req.user.roles);

            if (!req.user.roles.includes(requiredRole)) {
                console.log(
                    `❌ [Auth] Usuario no tiene el rol requerido: ${requiredRole}`,
                );
                return res.status(403).json({
                    message: 'Permisos insuficientes',
                });
            }

            console.log(
                `✅ [Auth] Usuario tiene el rol requerido: ${requiredRole}`,
            );
            next();
        } catch (error) {
            console.error('❌ [Auth] Error en verificación de rol:', error);
            return res.status(500).json({
                message: 'Error interno del servidor',
            });
        }
    };
};
