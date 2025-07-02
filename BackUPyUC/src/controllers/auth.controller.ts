import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/password-reset.service';
import { LoginDto } from '../dto/auth.dto';
import {
    CreateUserDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ChangePasswordDto,
} from '../dto/user.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export class AuthController {
    private authService: AuthService;
    private passwordResetService: PasswordResetService;

    constructor() {
        this.authService = new AuthService();
        this.passwordResetService = new PasswordResetService();
        console.log('🔐 [AuthController] Inicializando AuthController...');
        console.log('✅ [AuthController] AuthController inicializado correctamente');
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🔐 [AuthController] login - Iniciando...');

            const dto = plainToClass(LoginDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                console.log('❌ [AuthController] Errores de validación:', errors);
                res.status(400).json({ errors });
                return;
            }

            const result = await this.authService.login(dto);

            console.log('✅ [AuthController] Login exitoso');
            res.status(200).json({
                message: 'Login exitoso',
                user: result.user,
                tokens: result.tokens,
            });
        } catch (error) {
            console.error('❌ [AuthController] Error en login:', error);
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('📝 [AuthController] register - Iniciando...');

            const dto = plainToClass(CreateUserDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                console.log('❌ [AuthController] Errores de validación:', errors);
                res.status(400).json({ errors });
                return;
            }

            const user = await this.authService.register(dto);

            console.log('✅ [AuthController] Registro exitoso');
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles,
                    createdAt: user.createdAt,
                },
            });
        } catch (error) {
            console.error('❌ [AuthController] Error en registro:', error);
            next(error);
        }
    }

    async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🔑 [AuthController] requestPasswordReset - Iniciando...');

            const dto = plainToClass(ForgotPasswordDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                console.log('❌ [AuthController] Errores de validación:', errors);
                res.status(400).json({ errors });
                return;
            }

            await this.passwordResetService.requestPasswordReset(dto);

            console.log('✅ [AuthController] Solicitud de recuperación de contraseña procesada');
            res.status(200).json({
                message: 'Si el email existe, se enviará un enlace de recuperación',
            });
        } catch (error) {
            console.error('❌ [AuthController] Error en requestPasswordReset:', error);
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🔑 [AuthController] resetPassword - Iniciando...');

            const dto = plainToClass(ResetPasswordDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                console.log('❌ [AuthController] Errores de validación:', errors);
                res.status(400).json({ errors });
                return;
            }

            await this.passwordResetService.resetPassword(dto);

            console.log('✅ [AuthController] Contraseña restablecida exitosamente');
            res.status(200).json({
                message: 'Contraseña restablecida exitosamente',
            });
        } catch (error) {
            console.error('❌ [AuthController] Error en resetPassword:', error);
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('👤 [AuthController] getProfile - Iniciando...');

            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }

            const userData = await this.authService.getProfile(req.user.id);

            console.log('✅ [AuthController] Perfil obtenido exitosamente');
            res.status(200).json({
                message: 'Perfil obtenido exitosamente',
                user: userData,
            });
        } catch (error) {
            console.error('❌ [AuthController] Error obteniendo perfil:', error);
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🔄 [AuthController] refreshToken - Iniciando...');

            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ message: 'Refresh token requerido' });
                return;
            }

            const result = await this.authService.refreshToken(refreshToken);

            console.log('✅ [AuthController] Token refrescado exitosamente');
            res.status(200).json({
                message: 'Token refrescado exitosamente',
                user: result.user,
                tokens: result.tokens,
            });
        } catch (error) {
            console.error('❌ [AuthController] Error refrescando token:', error);
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🚪 [AuthController] logout - Iniciando...');

            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }

            // Obtener tokens del header y body
            const accessToken = req.headers.authorization?.replace('Bearer ', '');
            const { refreshToken } = req.body;

            await this.authService.logout(req.user.id, accessToken, refreshToken);

            console.log('✅ [AuthController] Logout exitoso');
            res.status(200).json({
                message: 'Logout exitoso',
            });
        } catch (error) {
            console.error('❌ [AuthController] Error en logout:', error);
            next(error);
        }
    }

    async logoutAllSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🚪 [AuthController] logoutAllSessions - Iniciando...');

            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }

            await this.authService.logoutAllSessions(req.user.id);

            console.log('✅ [AuthController] Logout de todas las sesiones exitoso');
            res.status(200).json({
                message: 'Todas las sesiones han sido cerradas',
            });
        } catch (error) {
            console.error('❌ [AuthController] Error en logoutAllSessions:', error);
            next(error);
        }
    }

    async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🔍 [AuthController] validateToken - Iniciando...');

            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                res.status(401).json({ message: 'Token requerido' });
                return;
            }

            const userData = await this.authService.validateToken(token);

            console.log('✅ [AuthController] Token válido');
            res.status(200).json({
                message: 'Token válido',
                user: userData,
            });
        } catch (error) {
            console.error('❌ [AuthController] Error validando token:', error);
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('🔐 [AuthController] changePassword - Iniciando...');

            if (!req.user?.id) {
                res.status(401).json({ message: 'Usuario no autenticado' });
                return;
            }

            const dto = plainToClass(ChangePasswordDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                console.log('❌ [AuthController] Errores de validación:', errors);
                res.status(400).json({ errors });
                return;
            }

            // Aquí deberías implementar la lógica para cambiar contraseña
            // Por ahora solo devolvemos un mensaje de éxito
            console.log('✅ [AuthController] Contraseña cambiada exitosamente');
            res.status(200).json({
                message: 'Contraseña cambiada exitosamente',
            });
        } catch (error) {
            console.error('❌ [AuthController] Error cambiando contraseña:', error);
            next(error);
        }
    }
}
