import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { ApiError } from '../../utils/api-error';
import { HttpStatus } from '../../utils/http-status';
import { UpdateUserDto } from '../../dto/user.dto';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const user = await this.userService.getUserById(Number(req.user.id));
            res.status(HttpStatus.OK).json(user);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const updateData: UpdateUserDto = req.body;
            const updatedUser = await this.userService.updateUser(Number(req.user.id), updateData);
            res.status(HttpStatus.OK).json(updatedUser);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            await this.userService.changePassword(Number(req.user.id), req.body);
            res.status(HttpStatus.OK).json({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async getFavoriteFields(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const fields = await this.userService.getFavoriteFields(Number(req.user.id));
            res.status(HttpStatus.OK).json(fields);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async addFavoriteField(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const { fieldId } = req.body;
            await this.userService.addFavoriteField(Number(req.user.id), Number(fieldId));
            res.status(HttpStatus.CREATED).json({ message: 'Campo agregado a favoritos' });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async removeFavoriteField(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const { fieldId } = req.params;
            await this.userService.removeFavoriteField(Number(req.user.id), Number(fieldId));
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async getNotifications(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const notifications = await this.userService.getNotifications(Number(req.user.id));
            res.status(HttpStatus.OK).json(notifications);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async markNotificationAsRead(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const { id } = req.params;
            await this.userService.markNotificationAsRead(Number(req.user.id), Number(id));
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const users = await this.userService.getAllUsers();
            res.status(HttpStatus.OK).json(users);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async blockUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, 'ID de usuario inválido');
            }
            const user = await this.userService.blockUser(id);
            res.status(HttpStatus.OK).json(user);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async unblockUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, 'ID de usuario inválido');
            }
            const user = await this.userService.unblockUser(id);
            res.status(HttpStatus.OK).json(user);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async updateRoles(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, 'ID de usuario inválido');
            }
            const { roles } = req.body;
            const user = await this.userService.updateRoles(id, roles);
            res.status(HttpStatus.OK).json(user);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }
}
