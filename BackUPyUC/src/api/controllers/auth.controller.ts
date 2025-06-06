import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { PasswordResetService } from '../services/password-reset.service';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import {
    CreateUserDto,
    LoginDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
} from '../dto/auth.dto';

export class AuthController {
    private authService: AuthService;
    private userService: UserService;
    private passwordResetService: PasswordResetService;

    constructor() {
        console.log('🏗️ [AuthController] Inicializando AuthController...');
        this.authService = new AuthService();
        this.userService = new UserService();
        this.passwordResetService = new PasswordResetService();

        // Bind methods to maintain context
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.logout = this.logout.bind(this);
        this.requestPasswordReset = this.requestPasswordReset.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.validateToken = this.validateToken.bind(this);
        this.changePassword = this.changePassword.bind(this);

        console.log('✅ [AuthController] AuthController inicializado correctamente');
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            console.log('🔐 [AuthController] login - Iniciando...');
            const loginData: LoginDto = req.body;

            console.log('📊 [AuthController] Datos de login:', {
                email: loginData.email,
                passwordLength: loginData.password?.length,
            });

            const result = await this.authService.login(loginData);

            console.log('✅ [AuthController] Login exitoso para:', loginData.email);
            return res.json(result);
        } catch (error) {
            console.error('❌ [AuthController] Error en login:', error);
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al iniciar sesión',
            });
        }
    }

    async register(req: Request, res: Response): Promise<Response> {
        try {
            console.log('📝 [AuthController] register - Iniciando...');
            const userData: CreateUserDto = req.body;
            const user = await this.userService.createUser(userData);
            return res.status(HttpStatus.CREATED).json({
                message: 'Usuario registrado exitosamente',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles,
                },
            });
        } catch (error) {
            console.error('❌ [AuthController] Error en registro:', error);
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al registrar usuario',
            });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<Response> {
        try {
            console.log('🔄 [AuthController] refreshToken - Iniciando...');
            const { refreshToken } = req.body;

            console.log('🎫 [AuthController] Refresh token presente:', !!refreshToken);

            const result = await this.authService.refreshToken(refreshToken);

            console.log('✅ [AuthController] Token actualizado exitosamente');
            return res.json(result);
        } catch (error) {
            console.error('❌ [AuthController] Error actualizando token:', error);
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al refrescar el token',
            });
        }
    }

    async logout(req: Request, res: Response): Promise<Response> {
        try {
            console.log('👋 [AuthController] logout - Iniciando...');
            const { refreshToken } = req.body;

            console.log('🎫 [AuthController] Invalidando refresh token');

            await this.authService.logout(refreshToken);

            console.log('✅ [AuthController] Logout exitoso');
            return res.json({ message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            console.error('❌ [AuthController] Error en logout:', error);
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al cerrar sesión',
            });
        }
    }

    async requestPasswordReset(req: Request, res: Response): Promise<Response> {
        try {
            const data: RequestPasswordResetDto = req.body;
            await this.passwordResetService.requestPasswordReset(data);
            return res.status(HttpStatus.OK).json({
                message:
                    'Se ha enviado un correo con las instrucciones para restablecer la contraseña',
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al solicitar el restablecimiento de contraseña',
            });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<Response> {
        try {
            const data: ResetPasswordDto = req.body;
            await this.passwordResetService.resetPassword(data);
            return res.status(HttpStatus.OK).json({
                message: 'Contraseña restablecida exitosamente',
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al restablecer la contraseña',
            });
        }
    }

    async validateToken(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new ApiError('No se proporcionó token', HttpStatus.UNAUTHORIZED);
            }
            const user = await this.authService.validateToken(token);
            return res.status(HttpStatus.OK).json({
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles,
                },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    valid: false,
                    message: error.message,
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                valid: false,
                message: 'Error al validar el token',
            });
        }
    }

    async changePassword(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { currentPassword, newPassword } = req.body;
            await this.userService.changePassword(req.user.id, currentPassword, newPassword);
            return res.status(HttpStatus.OK).json({
                message: 'Contraseña actualizada exitosamente',
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al cambiar la contraseña',
            });
        }
    }
}
