import { NotificationService } from '../../api/services/notification.service';
import { AppDataSource } from '../../config/database';
import { Notification } from '../../models/notification.model';

// Mock del módulo de base de datos
jest.mock('../../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
        })),
    },
}));

describe('NotificationService', () => {
    let service: NotificationService;
    let mockRepository: any;

    beforeEach(() => {
        service = new NotificationService();
        mockRepository = AppDataSource.getRepository(Notification);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getNotificationsByUserId', () => {
        it('debe devolver la lista de notificaciones', async () => {
            const mockNotifications = [{ id: '1', message: 'Test Notification', isRead: false }];
            mockRepository.find.mockResolvedValue(mockNotifications);
            const result = await service.getNotificationsByUserId('1');
            expect(result).toEqual(mockNotifications);
        });
    });

    describe('markAsRead', () => {
        it('debe devolver true si la notificación se marca como leída', async () => {
            const mockNotification = { id: '1', message: 'Test Notification', isRead: false };
            mockRepository.findOne.mockResolvedValue(mockNotification);
            mockRepository.save.mockResolvedValue({ ...mockNotification, isRead: true });
            const result = await service.markAsRead('1', '1');
            expect(result).toBe(true);
        });

        it('debe devolver false si la notificación no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const result = await service.markAsRead('1', '1');
            expect(result).toBe(false);
        });
    });
});
