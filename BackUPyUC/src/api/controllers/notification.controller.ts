import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiError } from '../../utils/api-error';
import { HttpStatus } from '../../utils/http-status';

export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    async getNotifications(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }

            const userId = req.user.id;
            const notifications = await this.notificationService.getNotificationsByUserId(userId);
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

    async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }

            const userId = req.user.id;
            const notificationId = parseInt(req.params.id);

            if (isNaN(notificationId)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, 'ID de notificación inválido');
            }

            const success = await this.notificationService.markAsRead(notificationId, userId);

            if (!success) {
                throw new ApiError(HttpStatus.NOT_FOUND, 'Notificación no encontrada');
            }

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
}
