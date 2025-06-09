import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../../services/password-reset.service';
import { ApiError } from '../../core/errors/api.error';
import { HttpStatus } from '../../core/constants';
import { LoginDto, ResetPasswordDto, RegisterDto, ForgotPasswordDto } from '../dto/auth.dto';
import { AuthenticatedUser } from '../../types/user.types';

interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

interface UserResponse {
    id: string;
    email: string;
    name: string;
    roles: string[];
}

export class AuthController {
    private authService: AuthService;
    private passwordResetService: PasswordResetService;

    constructor() {
        console.log('🏗️ [AuthController] Inicializando AuthController...');
        this.authService = new AuthService();
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
        this.getProfile = this.getProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);

        console.log('✅ [AuthController] AuthController inicializado correctamente');
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const loginData: LoginDto = req.body;
            const result = await this.authService.login(loginData);
            res.json(result);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const registerDto: RegisterDto = req.body;
            const result = await this.authService.register(registerDto);
            res.status(HttpStatus.CREATED).json(result);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshToken(refreshToken);
            res.json(result);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al refrescar el token',
            });
        }
    }

    async logout(_req: Request, res: Response): Promise<void> {
        try {
            res.status(HttpStatus.OK).json({ message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async requestPasswordReset(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.passwordResetService.requestPasswordReset(email);
            res.status(HttpStatus.OK).json({
                message:
                    'Se ha enviado un correo con las instrucciones para restablecer la contraseña',
            });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al solicitar el restablecimiento de contraseña',
            });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const resetPasswordDto: ResetPasswordDto = req.body;
            await this.passwordResetService.resetPassword(resetPasswordDto);
            res.json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async validateToken(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new ApiError('No se proporcionó token', HttpStatus.UNAUTHORIZED);
            }
            const user = await this.authService.validateToken(token);
            const userResponse: UserResponse = {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
                roles: user.roles,
            };
            res.status(HttpStatus.OK).json({
                valid: true,
                user: userResponse,
            });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al validar el token',
            });
        }
    }

    async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { currentPassword, newPassword } = req.body;
            await this.authService.changePassword(
                Number(req.user.id),
                currentPassword,
                newPassword
            );
            res.status(HttpStatus.OK).json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const user = await this.authService.getProfile(Number(req.user.id));
            res.json(user);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const updatedUser = await this.authService.updateProfile(Number(req.user.id), req.body);
            res.json(updatedUser);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<Response> {
        try {
            const { email } = req.body as ForgotPasswordDto;
            await this.authService.forgotPassword(email);
            return res.status(HttpStatus.OK).json({
                message: 'Si el email existe, se enviará un enlace de recuperación',
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error interno del servidor' });
        }
    }
}
