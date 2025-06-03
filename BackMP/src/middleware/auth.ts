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
            };
        }
    }
}

export const authenticate = (requiredRoles: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('🔐 [Auth] authenticate - Iniciando autenticación...');
            console.log('🔍 [Auth] Required roles:', requiredRoles);
            console.log('📡 [Auth] Request path:', req.path);
            console.log('📡 [Auth] Request method:', req.method);

            const authHeader = req.headers.authorization;
            console.log(
                '🎫 [Auth] Authorization header presente:',
                !!authHeader,
            );

            if (!authHeader) {
                console.log(
                    '❌ [Auth] No se proporcionó token de autenticación',
                );
                return res.status(401).json({
                    status: 'error',
                    message: 'No se proporcionó token de autenticación',
                });
            }

            if (!authHeader.startsWith('Bearer ')) {
                console.log(
                    '❌ [Auth] Formato de token inválido - no empieza con Bearer',
                );
                return res.status(401).json({
                    status: 'error',
                    message: 'Formato de token inválido',
                });
            }

            const token = authHeader.split(' ')[1];
            console.log(
                '🎫 [Auth] Token extraído (primeros 20 caracteres):',
                token.substring(0, 20) + '...',
            );

            try {
                console.log('🔍 [Auth] Verificando token JWT...');
                const decoded = jwt.verify(token, config.jwt.secret) as {
                    sub: string;
                    email: string;
                    roles: string[];
                    exp: number;
                };

                console.log('✅ [Auth] Token JWT válido');
                console.log('👤 [Auth] Usuario decodificado:', {
                    id: decoded.sub,
                    email: decoded.email,
                    roles: decoded.roles,
                });

                const currentTimestamp = Math.floor(Date.now() / 1000);
                console.log(
                    '⏰ [Auth] Verificando expiración - Current:',
                    currentTimestamp,
                    'Token exp:',
                    decoded.exp,
                );

                if (decoded.exp < currentTimestamp) {
                    console.log('❌ [Auth] Token expirado');
                    return res.status(401).json({
                        status: 'error',
                        message: 'Token expirado',
                    });
                }

                if (requiredRoles.length > 0) {
                    console.log(
                        '🔒 [Auth] Verificando roles requeridos:',
                        requiredRoles,
                    );
                    console.log('👤 [Auth] Roles del usuario:', decoded.roles);

                    const hasRequiredRole = requiredRoles.some((role) =>
                        decoded.roles.includes(role),
                    );

                    if (!hasRequiredRole) {
                        console.log(
                            '❌ [Auth] Usuario no tiene los roles necesarios',
                        );
                        return res.status(403).json({
                            status: 'error',
                            message: 'No tienes los permisos necesarios',
                        });
                    }

                    console.log('✅ [Auth] Usuario tiene los roles necesarios');
                }

                req.user = {
                    id: decoded.sub,
                    email: decoded.email,
                    roles: decoded.roles,
                };

                console.log(
                    '✅ [Auth] Autenticación exitosa - Usuario establecido en request',
                );
                next();
            } catch (error) {
                console.error('❌ [Auth] Error al verificar token:', error);

                if (error instanceof jwt.JsonWebTokenError) {
                    console.log('❌ [Auth] JsonWebTokenError - Token inválido');
                    return res.status(401).json({
                        status: 'error',
                        message: 'Token inválido',
                    });
                }

                if (error instanceof jwt.TokenExpiredError) {
                    console.log('❌ [Auth] TokenExpiredError - Token expirado');
                    return res.status(401).json({
                        status: 'error',
                        message: 'Token expirado',
                    });
                }

                console.error(
                    '❌ [Auth] Error desconocido en autenticación:',
                    error,
                );
                return res.status(500).json({
                    status: 'error',
                    message: 'Error en la autenticación',
                });
            }
        } catch (error) {
            console.error(
                '❌ [Auth] Error interno del servidor en autenticación:',
                error,
            );
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
            });
        }
    };
};

export const requireRole = (role: string) => {
    console.log('🔒 [Auth] requireRole configurado para rol:', role);
    return authenticate([role]);
};

export const isOwner = (paramIdField: string = 'id') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(
                '👤 [Auth] isOwner - Verificando propiedad del recurso...',
            );
            console.log('🔍 [Auth] Parameter field:', paramIdField);

            const resourceId = req.params[paramIdField];
            console.log('🆔 [Auth] Resource ID:', resourceId);
            console.log('👤 [Auth] User ID:', req.user?.id);

            if (req.user?.id !== resourceId) {
                console.log('❌ [Auth] Usuario no es propietario del recurso');
                return res.status(403).json({
                    status: 'error',
                    message: 'No tienes permiso para acceder a este recurso',
                });
            }

            console.log('✅ [Auth] Usuario es propietario del recurso');
            next();
        } catch (error) {
            console.error(
                '❌ [Auth] Error al verificar la propiedad del recurso:',
                error,
            );
            return res.status(500).json({
                status: 'error',
                message: 'Error al verificar la propiedad del recurso',
            });
        }
    };
};
