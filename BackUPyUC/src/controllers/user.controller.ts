import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { FavoriteField } from '../models/favorite-field.model';
import { Notification } from '../models/notification.model';

// Extender el tipo Request para incluir user
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

export class UserController {
    private userRepository = AppDataSource.getRepository(User);
    private favoriteFieldRepository =
        AppDataSource.getRepository(FavoriteField);
    private notificationRepository = AppDataSource.getRepository(Notification);

    constructor() {
        console.log('🏗️ [UserController] Inicializando UserController...');
        console.log(
            '✅ [UserController] UserController inicializado correctamente',
        );
    }

    // Favorite Fields
    async addFavoriteField(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('⭐ [UserController] addFavoriteField - Iniciando...');

            // Validar que el usuario esté autenticado
            if (!req.user || !req.user.id) {
                console.log('❌ [UserController] Usuario no autenticado');
                return res.status(401).json({
                    message: 'Usuario no autenticado',
                });
            }

            const userId = req.user.id;
            console.log('👤 [UserController] Usuario ID:', userId);

            const { fieldId, name } = req.body;
            console.log('📊 [UserController] Datos del campo favorito:', {
                fieldId,
                name,
                userId,
            });

            const favoriteField = this.favoriteFieldRepository.create({
                fieldId,
                name,
                user: { id: userId },
            });

            console.log('💾 [UserController] Guardando campo favorito...');
            await this.favoriteFieldRepository.save(favoriteField);

            console.log(
                '✅ [UserController] Campo favorito agregado exitosamente:',
                favoriteField,
            );
            return res.status(201).json(favoriteField);
        } catch (error) {
            console.error(
                '❌ [UserController] Error al agregar campo favorito:',
                error,
            );
            next(error);
        }
    }

    async removeFavoriteField(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(
                '🗑️ [UserController] removeFavoriteField - Iniciando...',
            );

            // Validar que el usuario esté autenticado
            if (!req.user || !req.user.id) {
                console.log('❌ [UserController] Usuario no autenticado');
                return res.status(401).json({
                    message: 'Usuario no autenticado',
                });
            }

            const userId = req.user.id;
            const { fieldId } = req.params;

            console.log('👤 [UserController] Usuario ID:', userId);
            console.log('🎯 [UserController] Campo a eliminar:', fieldId);

            await this.favoriteFieldRepository.delete({
                fieldId,
                user: { id: userId },
            });

            console.log(
                '✅ [UserController] Campo favorito eliminado exitosamente',
            );
            return res
                .status(200)
                .json({ message: 'Campo favorito eliminado' });
        } catch (error) {
            console.error(
                '❌ [UserController] Error al eliminar campo favorito:',
                error,
            );
            next(error);
        }
    }

    async getFavoriteFields(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('📋 [UserController] getFavoriteFields - Iniciando...');

            // Validar que el usuario esté autenticado
            if (!req.user || !req.user.id) {
                console.log('❌ [UserController] Usuario no autenticado');
                return res.status(401).json({
                    message: 'Usuario no autenticado',
                });
            }

            const userId = req.user.id;
            console.log('👤 [UserController] Usuario ID:', userId);

            const favoriteFields = await this.favoriteFieldRepository.find({
                where: { user: { id: userId } },
            });

            console.log(
                `📊 [UserController] Se encontraron ${favoriteFields.length} campos favoritos para el usuario ${userId}`,
            );
            return res.json(favoriteFields);
        } catch (error) {
            console.error(
                '❌ [UserController] Error al obtener campos favoritos:',
                error,
            );
            next(error);
        }
    }

    // Notifications
    async getNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('🔔 [UserController] getNotifications - Iniciando...');

            // Validar que el usuario esté autenticado
            if (!req.user || !req.user.id) {
                console.log('❌ [UserController] Usuario no autenticado');
                return res.status(401).json({
                    message: 'Usuario no autenticado',
                });
            }

            const userId = req.user.id;
            console.log('👤 [UserController] Usuario ID:', userId);

            const notifications = await this.notificationRepository.find({
                where: { user: { id: userId } },
                order: { createdAt: 'DESC' },
            });

            console.log(
                `📊 [UserController] Se encontraron ${notifications.length} notificaciones para el usuario ${userId}`,
            );
            return res.json({ notifications });
        } catch (error) {
            console.error(
                '❌ [UserController] Error al obtener notificaciones:',
                error,
            );
            next(error);
        }
    }

    async markNotificationAsRead(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            console.log(
                '✅ [UserController] markNotificationAsRead - Iniciando...',
            );

            // Validar que el usuario esté autenticado
            if (!req.user || !req.user.id) {
                console.log('❌ [UserController] Usuario no autenticado');
                return res.status(401).json({
                    message: 'Usuario no autenticado',
                });
            }

            const { id } = req.params;
            const userId = req.user.id;

            console.log(
                '📊 [UserController] Marcando notificación como leída:',
                { notificationId: id, userId },
            );

            await this.notificationRepository.update(
                { id, user: { id: userId } },
                { read: true },
            );

            console.log(
                '✅ [UserController] Notificación marcada como leída exitosamente',
            );
            return res.json({ message: 'Notificación marcada como leída' });
        } catch (error) {
            console.error(
                '❌ [UserController] Error al actualizar notificación:',
                error,
            );
            next(error);
        }
    }

    async deleteNotification(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(
                '🗑️ [UserController] deleteNotification - Iniciando...',
            );

            // Validar que el usuario esté autenticado
            if (!req.user || !req.user.id) {
                console.log('❌ [UserController] Usuario no autenticado');
                return res.status(401).json({
                    message: 'Usuario no autenticado',
                });
            }

            const { id } = req.params;
            const userId = req.user.id;

            console.log('📊 [UserController] Eliminando notificación:', {
                notificationId: id,
                userId,
            });

            await this.notificationRepository.delete({
                id,
                user: { id: userId },
            });

            console.log(
                '✅ [UserController] Notificación eliminada exitosamente',
            );
            return res.json({ message: 'Notificación eliminada' });
        } catch (error) {
            console.error(
                '❌ [UserController] Error al eliminar notificación:',
                error,
            );
            next(error);
        }
    }

    // Profile
    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('👤 [UserController] updateProfile - Iniciando...');

            // Validar que el usuario esté autenticado
            if (!req.user || !req.user.id) {
                console.log('❌ [UserController] Usuario no autenticado');
                return res.status(401).json({
                    message: 'Usuario no autenticado',
                });
            }

            const userId = req.user.id;
            const { phone, preferredLocation, notificationPreferences } =
                req.body;

            console.log(
                '📊 [UserController] Datos de actualización del perfil:',
                {
                    userId,
                    phone,
                    preferredLocation,
                    notificationPreferences,
                },
            );

            await this.userRepository.update(userId, {
                phone,
                preferredLocation,
                notificationPreferences,
            });

            console.log(
                '💾 [UserController] Perfil actualizado, obteniendo datos actualizados...',
            );
            const updatedUser = await this.userRepository.findOne({
                where: { id: userId },
            });

            console.log('✅ [UserController] Perfil actualizado exitosamente');
            return res.json(updatedUser);
        } catch (error) {
            console.error(
                '❌ [UserController] Error al actualizar perfil:',
                error,
            );
            next(error);
        }
    }

    // Admin Routes
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('👥 [UserController] getAllUsers - Iniciando...');
            console.log(
                '🔐 [UserController] Solicitud de administrador para obtener todos los usuarios',
            );

            const users = await this.userRepository.find();

            console.log(
                `📊 [UserController] Se encontraron ${users.length} usuarios en total`,
            );
            return res.json(users);
        } catch (error) {
            console.error(
                '❌ [UserController] Error al obtener usuarios:',
                error,
            );
            return res
                .status(500)
                .json({ message: 'Error al obtener usuarios' });
        }
    }

    async blockUser(req: Request, res: Response) {
        try {
            console.log('🚫 [UserController] blockUser - Iniciando...');
            const { id } = req.params;

            console.log('📊 [UserController] Bloqueando usuario:', {
                userId: id,
            });

            await this.userRepository.update(id, { isBlocked: true });

            console.log('✅ [UserController] Usuario bloqueado exitosamente');
            return res.json({ message: 'Usuario bloqueado' });
        } catch (error) {
            console.error(
                '❌ [UserController] Error al bloquear usuario:',
                error,
            );
            return res
                .status(500)
                .json({ message: 'Error al bloquear usuario' });
        }
    }

    async updateUserRole(req: Request, res: Response) {
        try {
            console.log('🔧 [UserController] updateUserRole - Iniciando...');
            const { id } = req.params;
            const { role } = req.body;

            console.log('📊 [UserController] Actualizando rol del usuario:', {
                userId: id,
                newRole: role,
            });

            const user = await this.userRepository.findOne({
                where: { id },
            });

            if (!user) {
                console.log('❌ [UserController] Usuario no encontrado:', id);
                return res
                    .status(404)
                    .json({ message: 'Usuario no encontrado' });
            }

            console.log(
                '📋 [UserController] Usuario encontrado, rol actual:',
                user.roles,
            );

            user.roles = [role];
            await this.userRepository.save(user);

            console.log(
                '✅ [UserController] Rol actualizado exitosamente a:',
                role,
            );
            return res.json({ message: 'Rol actualizado' });
        } catch (error) {
            console.error(
                '❌ [UserController] Error al actualizar rol:',
                error,
            );
            return res.status(500).json({ message: 'Error al actualizar rol' });
        }
    }
}
