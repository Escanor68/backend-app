import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { config } from '../../config';

export interface LoginResult {
    user: {
        id: string;
        email: string;
        name: string;
    };
    accessToken: string;
    refreshToken: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export class AuthService {
    constructor() {
        console.log('🏗️ [AuthService] Inicializando AuthService...');
        console.log('✅ [AuthService] AuthService inicializado correctamente');
    }

    async login(email: string, password: string): Promise<LoginResult> {
        console.log('🔐 [AuthService] login - Iniciando autenticación...');
        console.log('📧 [AuthService] Email:', email);

        // Aquí iría la lógica real de verificación de credenciales
        // Por ahora simulamos la autenticación

        if (!email || !password) {
            console.log('❌ [AuthService] Credenciales incompletas');
            throw new Error('Email y contraseña son requeridos');
        }

        // Simular usuario encontrado
        const user = {
            id: 'user_' + Date.now(),
            email,
            name: 'Usuario Demo',
            roles: ['user'],
        };

        console.log('👤 [AuthService] Usuario encontrado:', user);

        // Generar tokens
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, roles: user.roles },
            config.jwt.secret as string,
            { expiresIn: config.jwt.expiresIn } as SignOptions,
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            config.jwt.refreshSecret as string,
            { expiresIn: config.jwt.refreshExpiresIn } as SignOptions,
        );

        console.log('🎫 [AuthService] Tokens generados exitosamente');
        console.log('✅ [AuthService] Login completado para:', email);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            accessToken,
            refreshToken,
        };
    }

    async register(data: RegisterData): Promise<LoginResult> {
        console.log('📝 [AuthService] register - Iniciando registro...');
        console.log('📊 [AuthService] Datos de registro:', {
            email: data.email,
            name: data.name,
        });

        // Aquí iría la lógica real de registro
        // Por ahora simulamos el registro

        if (!data.email || !data.password || !data.name) {
            console.log('❌ [AuthService] Datos de registro incompletos');
            throw new Error('Todos los campos son requeridos');
        }

        // Simular creación de usuario
        const user = {
            id: 'user_' + Date.now(),
            email: data.email,
            name: data.name,
            roles: ['user'],
        };

        console.log('👤 [AuthService] Usuario creado:', user);

        // Generar tokens
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, roles: user.roles },
            config.jwt.secret as string,
            { expiresIn: config.jwt.expiresIn } as SignOptions,
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            config.jwt.refreshSecret as string,
            { expiresIn: config.jwt.refreshExpiresIn } as SignOptions,
        );

        console.log('🎫 [AuthService] Tokens generados para nuevo usuario');
        console.log('✅ [AuthService] Registro completado para:', data.email);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshToken(
        refreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        console.log('🔄 [AuthService] refreshToken - Actualizando token...');

        if (!refreshToken) {
            console.log('❌ [AuthService] Refresh token no proporcionado');
            throw new Error('Refresh token requerido');
        }

        try {
            // Verificar refresh token
            const decoded = jwt.verify(
                refreshToken,
                config.jwt.refreshSecret,
            ) as any;
            console.log(
                '✅ [AuthService] Refresh token válido para usuario:',
                decoded.email,
            );

            // Generar nuevos tokens
            const newAccessToken = jwt.sign(
                {
                    id: decoded.id,
                    email: decoded.email,
                    roles: decoded.roles || ['user'],
                },
                config.jwt.secret as string,
                { expiresIn: config.jwt.expiresIn } as SignOptions,
            );

            const newRefreshToken = jwt.sign(
                { id: decoded.id, email: decoded.email },
                config.jwt.refreshSecret as string,
                { expiresIn: config.jwt.refreshExpiresIn } as SignOptions,
            );

            console.log('🎫 [AuthService] Nuevos tokens generados');
            console.log('✅ [AuthService] Token refresh completado');

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            console.error(
                '❌ [AuthService] Error al verificar refresh token:',
                error,
            );
            throw new Error('Refresh token inválido o expirado');
        }
    }

    async logout(refreshToken: string): Promise<void> {
        console.log('👋 [AuthService] logout - Invalidando sesión...');

        // Aquí iría la lógica para invalidar el refresh token
        // Por ejemplo, agregarlo a una blacklist

        console.log('🎫 [AuthService] Refresh token invalidado');
        console.log('✅ [AuthService] Logout completado');
    }
}
