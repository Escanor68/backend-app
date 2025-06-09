import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { UpdateUserDto, FavoriteFieldDto } from '../types/user.types';
import { AuthenticatedUser } from '../types/user.types';

interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

export class UserController {
    private userService: UserService;
    private authService: AuthService;

    constructor() {
        this.userService = new UserService();
        this.authService = new AuthService();
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.authService.register(req.body);
            res.status(HttpStatus.CREATED).json(user);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login({ email, password });
            res.json(result);
        } catch (error: unknown) {
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
            const user = await this.userService.getUserById(Number(req.user.id));
            res.json(user);
        } catch (error: unknown) {
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
            const updateData: UpdateUserDto = req.body;
            const user = await this.userService.updateUser(Number(req.user.id), updateData);
            res.json(user);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            await this.userService.changePassword(Number(req.user.id), req.body);
            res.status(HttpStatus.OK).json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.userService.forgotPassword(email);
            res.status(HttpStatus.OK).json({
                message: 'Se ha enviado un correo con instrucciones',
            });
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, newPassword } = req.body;
            await this.userService.resetPassword(token, newPassword);
            res.status(HttpStatus.OK).json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async getFavoriteFields(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const fields = await this.userService.getFavoriteFields(Number(req.user.id));
            res.json(fields);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async addFavoriteField(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { fieldId } = req.body;
            const favoriteField: FavoriteFieldDto = {
                userId: Number(req.user.id),
                fieldId: Number(fieldId),
            };
            const result = await this.userService.addFavoriteField(
                favoriteField.userId,
                favoriteField.fieldId
            );
            res.status(HttpStatus.OK).json(result);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async removeFavoriteField(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { fieldId } = req.params;
            await this.userService.removeFavoriteField(Number(req.user.id), Number(fieldId));
            res.status(HttpStatus.OK).json({ message: 'Campo favorito eliminado exitosamente' });
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const notifications = await this.userService.getNotifications(Number(req.user.id));
            res.json(notifications);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async markNotificationAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { id } = req.params;
            await this.userService.markNotificationAsRead(Number(req.user.id), Number(id));
            res.status(HttpStatus.OK).json({ message: 'Notificación marcada como leída' });
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { id } = req.params;
            const user = await this.userService.getUserById(Number(id));
            res.json(user);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { id } = req.params;
            const updateData: UpdateUserDto = req.body;
            const user = await this.userService.updateUser(Number(id), updateData);
            res.json(user);
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }

    async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { id } = req.params;
            await this.userService.deleteUser(Number(id));
            res.status(HttpStatus.OK).json({ message: 'Usuario eliminado exitosamente' });
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error interno del servidor',
            });
        }
    }
}
