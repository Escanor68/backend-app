import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { FavoriteField } from '../models/favorite-field.model';
import { Notification } from '../models/notification.model';

export class UserController {
    private userRepository = AppDataSource.getRepository(User);
    private favoriteFieldRepository = AppDataSource.getRepository(FavoriteField);
    private notificationRepository = AppDataSource.getRepository(Notification);

    // Favorite Fields
    async addFavoriteField(req: Request, res: Response) {
        try {
            const { fieldId, name } = req.body;
            const userId = req.user.id;

            const favoriteField = this.favoriteFieldRepository.create({
                fieldId,
                name,
                user: { id: userId }
            });

            await this.favoriteFieldRepository.save(favoriteField);
            return res.status(201).json(favoriteField);
        } catch (error) {
            return res.status(500).json({ message: 'Error al agregar campo favorito' });
        }
    }

    async removeFavoriteField(req: Request, res: Response) {
        try {
            const { fieldId } = req.params;
            const userId = req.user.id;

            await this.favoriteFieldRepository.delete({
                fieldId,
                user: { id: userId }
            });

            return res.status(200).json({ message: 'Campo favorito eliminado' });
        } catch (error) {
            return res.status(500).json({ message: 'Error al eliminar campo favorito' });
        }
    }

    async getFavoriteFields(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const favoriteFields = await this.favoriteFieldRepository.find({
                where: { user: { id: userId } }
            });

            return res.json(favoriteFields);
        } catch (error) {
            return res.status(500).json({ message: 'Error al obtener campos favoritos' });
        }
    }

    // Notifications
    async getNotifications(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const notifications = await this.notificationRepository.find({
                where: { user: { id: userId } },
                order: { createdAt: 'DESC' }
            });

            return res.json({ notifications });
        } catch (error) {
            return res.status(500).json({ message: 'Error al obtener notificaciones' });
        }
    }

    async markNotificationAsRead(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await this.notificationRepository.update(
                { id, user: { id: userId } },
                { read: true }
            );

            return res.json({ message: 'Notificación marcada como leída' });
        } catch (error) {
            return res.status(500).json({ message: 'Error al actualizar notificación' });
        }
    }

    async deleteNotification(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await this.notificationRepository.delete({
                id,
                user: { id: userId }
            });

            return res.json({ message: 'Notificación eliminada' });
        } catch (error) {
            return res.status(500).json({ message: 'Error al eliminar notificación' });
        }
    }

    // Profile
    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const { phone, preferredLocation, notificationPreferences } = req.body;

            await this.userRepository.update(userId, {
                phone,
                preferredLocation,
                notificationPreferences
            });

            const updatedUser = await this.userRepository.findOne({
                where: { id: userId }
            });

            return res.json(updatedUser);
        } catch (error) {
            return res.status(500).json({ message: 'Error al actualizar perfil' });
        }
    }

    // Admin Routes
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await this.userRepository.find();
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }

    async blockUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await this.userRepository.update(id, { isBlocked: true });
            return res.json({ message: 'Usuario bloqueado' });
        } catch (error) {
            return res.status(500).json({ message: 'Error al bloquear usuario' });
        }
    }

    async updateUserRole(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            const user = await this.userRepository.findOne({
                where: { id }
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            user.roles = [role];
            await this.userRepository.save(user);

            return res.json({ message: 'Rol actualizado' });
        } catch (error) {
            return res.status(500).json({ message: 'Error al actualizar rol' });
        }
    }
} 