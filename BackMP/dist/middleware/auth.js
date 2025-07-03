"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwner = exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticate = (requiredRoles = []) => {
    return async (req, res, next) => {
        try {
            console.log('🔐 [Auth] authenticate - Iniciando autenticación...');
            console.log('🔍 [Auth] Required roles:', requiredRoles);
            console.log('📡 [Auth] Request path:', req.path);
            console.log('📡 [Auth] Request method:', req.method);
            const authHeader = req.headers.authorization;
            console.log('🎫 [Auth] Authorization header presente:', !!authHeader);
            if (!authHeader) {
                console.log('❌ [Auth] No se proporcionó token de autenticación');
                res.status(401).json({
                    status: 'error',
                    message: 'No se proporcionó token de autenticación',
                });
                return;
            }
            if (!authHeader.startsWith('Bearer ')) {
                console.log('❌ [Auth] Formato de token inválido - no empieza con Bearer');
                res.status(401).json({
                    status: 'error',
                    message: 'Formato de token inválido',
                });
                return;
            }
            const token = authHeader.split(' ')[1];
            console.log('🎫 [Auth] Token extraído (primeros 20 caracteres):', token.substring(0, 20) + '...');
            try {
                console.log('🔍 [Auth] Verificando token JWT...');
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
                console.log('✅ [Auth] Token JWT válido');
                console.log('👤 [Auth] Usuario decodificado:', {
                    id: decoded.sub,
                    email: decoded.email,
                    roles: decoded.roles,
                });
                const currentTimestamp = Math.floor(Date.now() / 1000);
                console.log('⏰ [Auth] Verificando expiración - Current:', currentTimestamp, 'Token exp:', decoded.exp);
                if (decoded.exp < currentTimestamp) {
                    console.log('❌ [Auth] Token expirado');
                    res.status(401).json({
                        status: 'error',
                        message: 'Token expirado',
                    });
                    return;
                }
                if (requiredRoles.length > 0) {
                    console.log('🔒 [Auth] Verificando roles requeridos:', requiredRoles);
                    console.log('👤 [Auth] Roles del usuario:', decoded.roles);
                    const hasRequiredRole = requiredRoles.some((role) => decoded.roles.includes(role));
                    if (!hasRequiredRole) {
                        console.log('❌ [Auth] Usuario no tiene los roles necesarios');
                        res.status(403).json({
                            status: 'error',
                            message: 'No tienes los permisos necesarios',
                        });
                        return;
                    }
                    console.log('✅ [Auth] Usuario tiene los roles necesarios');
                }
                req.user = {
                    id: decoded.sub,
                    email: decoded.email,
                    roles: decoded.roles,
                };
                console.log('✅ [Auth] Autenticación exitosa - Usuario establecido en request');
                next();
            }
            catch (error) {
                console.error('❌ [Auth] Error al verificar token:', error);
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    console.log('❌ [Auth] JsonWebTokenError - Token inválido');
                    res.status(401).json({
                        status: 'error',
                        message: 'Token inválido',
                    });
                    return;
                }
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    console.log('❌ [Auth] TokenExpiredError - Token expirado');
                    res.status(401).json({
                        status: 'error',
                        message: 'Token expirado',
                    });
                    return;
                }
                console.error('❌ [Auth] Error desconocido en autenticación:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Error en la autenticación',
                });
                return;
            }
        }
        catch (error) {
            console.error('❌ [Auth] Error interno del servidor en autenticación:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
            });
            return;
        }
    };
};
exports.authenticate = authenticate;
const requireRole = (role) => {
    console.log('🔒 [Auth] requireRole configurado para rol:', role);
    return (0, exports.authenticate)([role]);
};
exports.requireRole = requireRole;
const isOwner = (paramIdField = 'id') => {
    return async (req, res, next) => {
        try {
            console.log('👤 [Auth] isOwner - Verificando propiedad del recurso...');
            console.log('🔍 [Auth] Parameter field:', paramIdField);
            const resourceId = req.params[paramIdField];
            console.log('🆔 [Auth] Resource ID:', resourceId);
            console.log('👤 [Auth] User ID:', req.user?.id);
            if (req.user?.id !== resourceId) {
                console.log('❌ [Auth] Usuario no es propietario del recurso');
                res.status(403).json({
                    status: 'error',
                    message: 'No tienes permiso para acceder a este recurso',
                });
                return;
            }
            console.log('✅ [Auth] Usuario es propietario del recurso');
            next();
        }
        catch (error) {
            console.error('❌ [Auth] Error al verificar la propiedad del recurso:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al verificar la propiedad del recurso',
            });
            return;
        }
    };
};
exports.isOwner = isOwner;
//# sourceMappingURL=auth.js.map