import { Notification } from '../../models/notification.model';
import { AppDataSource } from '../../config/database';

export class NotificationService {
    private notificationRepository = AppDataSource.getRepository(Notification);

    async getNotificationsByUserId(userId: number): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: number, userId: number): Promise<boolean> {
        const notification = await this.notificationRepository.findOne({
            where: { id, userId },
        });
        if (!notification) {
            return false;
        }
        notification.isRead = true;
        await this.notificationRepository.save(notification);
        return true;
    }
}
