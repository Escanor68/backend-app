import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { FavoriteField } from '../models/favorite-field.model';
import { Notification } from '../models/notification.model';
import {
    CreateUserDto,
    UpdateUserDto,
    UpdatePasswordDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
} from '../dto/user.dto';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/password-reset.service';

// Extender el tipo Request para incluir user
declare module 'express' {
    interface Request {
        user?: {
            id: string;
            email: string;
            roles: string[];
        };
    }
}

export class UserController {
    private favoriteFieldRepository = AppDataSource.getRepository(FavoriteField);
    private notificationRepository = AppDataSource.getRepository(Notification);
    private userService: UserService;
    private authService: AuthService;
    private passwordResetService: PasswordResetService;

    constructor() {
        this.userService = new UserService();
        this.authService = new AuthService();
        this.passwordResetService = new PasswordResetService();
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData: CreateUserDto = req.body;
            const user = await this.userService.createUser(userData);
            res.status(HttpStatus.CREATED).json(user);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login({ email, password });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const user = await this.userService.getUserById(req.user.id);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const updateData: UpdateUserDto = req.body;
            const user = await this.userService.updateUser(req.user.id, updateData);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body as RequestPasswordResetDto;
            await this.passwordResetService.requestPasswordReset(email);
            res.status(HttpStatus.OK).json({
                message: 'Si el email existe, se enviará un enlace de recuperación',
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, newPassword } = req.body as ResetPasswordDto;
            await this.passwordResetService.resetPassword(token, newPassword);
            res.status(HttpStatus.OK).json({
                message: 'Contraseña actualizada correctamente',
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await this.userService.getAllUsers();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new ApiError('ID de usuario inválido', HttpStatus.BAD_REQUEST);
            }
            const user = await this.userService.getUserById(userId);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new ApiError('ID de usuario inválido', HttpStatus.BAD_REQUEST);
            }
            const updateData: UpdateUserDto = req.body;
            const user = await this.userService.updateUser(userId, updateData);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new ApiError('ID de usuario inválido', HttpStatus.BAD_REQUEST);
            }
            await this.userService.deleteUser(userId);
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    }

    async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new ApiError('ID de usuario inválido', HttpStatus.BAD_REQUEST);
            }
            const user = await this.userService.blockUser(userId);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async unblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new ApiError('ID de usuario inválido', HttpStatus.BAD_REQUEST);
            }
            const user = await this.userService.unblockUser(userId);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { currentPassword, newPassword } = req.body;
            await this.userService.changePassword(req.user.id, currentPassword, newPassword);
            res.status(HttpStatus.OK).json({
                message: 'Contraseña actualizada correctamente',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new ApiError('ID de usuario inválido', HttpStatus.BAD_REQUEST);
            }
            const { roles } = req.body;
            const user = await this.userService.updateRoles(userId, roles);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const passwordData: UpdatePasswordDto = req.body;
            await this.userService.updatePassword(req.user.id, passwordData);
            res.json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            next(error);
        }
    }

    // Favorite Fields
    async addFavoriteField(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }

            const { fieldId, name } = req.body;

            const favoriteField = this.favoriteFieldRepository.create({
                fieldId,
                name,
                user: { id: req.user.id },
            });

            const savedField = await this.favoriteFieldRepository.save(favoriteField);
            res.status(HttpStatus.CREATED).json(savedField);
        } catch (error) {
            next(error);
        }
    }

    async removeFavoriteField(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }

            const userId = req.user.id;
            const { fieldId } = req.params;

            await this.favoriteFieldRepository.delete({
                fieldId,
                user: { id: userId },
            });

            res.status(HttpStatus.OK).json({ message: 'Campo favorito eliminado' });
        } catch (error) {
            next(error);
        }
    }

    async getFavoriteFields(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }

            const favoriteFields = await this.favoriteFieldRepository.find({
                where: { user: { id: req.user.id } },
            });

            res.json(favoriteFields);
        } catch (error) {
            next(error);
        }
    }

    // Notifications
    async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }

            const notifications = await this.notificationRepository.find({
                where: { user: { id: req.user.id } },
                order: { createdAt: 'DESC' },
            });

            res.json({ notifications });
        } catch (error) {
            next(error);
        }
    }

    async markNotificationAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }

            const { id } = req.params;
            const userId = req.user.id;

            await this.notificationRepository.update({ id, user: { id: userId } }, { read: true });

            res.json({ message: 'Notificación marcada como leída' });
        } catch (error) {
            next(error);
        }
    }

    async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }

            const { id } = req.params;
            const userId = req.user.id;

            await this.notificationRepository.delete({
                id,
                user: { id: userId },
            });

            res.json({ message: 'Notificación eliminada' });
        } catch (error) {
            next(error);
        }
    }
}
