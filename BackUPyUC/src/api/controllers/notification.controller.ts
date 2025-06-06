import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';

export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    async getNotifications(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const notifications = await this.notificationService.getNotificationsByUserId(userId);
            return res.json(notifications);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error interno del servidor' });
        }
    }

    async markAsRead(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const updated = await this.notificationService.markAsRead(id, userId);
            if (!updated) {
                throw new ApiError('Notificación no encontrada', HttpStatus.NOT_FOUND);
            }
            return res.status(HttpStatus.NO_CONTENT).send();
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
