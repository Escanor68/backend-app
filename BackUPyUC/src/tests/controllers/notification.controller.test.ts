import { NotificationController } from '../../api/controllers/notification.controller';
import { Request, Response } from 'express';
import { HttpStatus } from '../../utils/http-status';

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

describe('NotificationController', () => {
    let controller: NotificationController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        controller = new NotificationController();
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        req = { body: {}, user: { id: '1', email: 'test@example.com', roles: ['user'] } };
        res = { status: statusMock, json: jsonMock } as unknown as Response;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getNotifications', () => {
        it('debe devolver 200 y la lista de notificaciones', async () => {
            const mockNotifications = [{ id: '1', message: 'Test Notification', isRead: false }];
            controller['notificationService'] = {
                getNotificationsByUserId: jest.fn().mockResolvedValue(mockNotifications),
            } as any;
            await controller.getNotifications(req as Request, res as Response);
            expect(jsonMock).toHaveBeenCalledWith(mockNotifications);
        });

        it('debe devolver 401 si el usuario no está autenticado', async () => {
            req.user = undefined;
            await controller.getNotifications(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Usuario no autenticado' });
        });
    });

    describe('markAsRead', () => {
        it('debe devolver 204 si la notificación se marca como leída', async () => {
            controller['notificationService'] = {
                markAsRead: jest.fn().mockResolvedValue(true),
            } as any;
            req.params = { id: '1' };
            await controller.markAsRead(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
        });

        it('debe devolver 404 si la notificación no existe', async () => {
            controller['notificationService'] = {
                markAsRead: jest.fn().mockResolvedValue(false),
            } as any;
            req.params = { id: '1' };
            await controller.markAsRead(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Notificación no encontrada' });
        });

        it('debe devolver 401 si el usuario no está autenticado', async () => {
            req.user = undefined;
            req.params = { id: '1' };
            await controller.markAsRead(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Usuario no autenticado' });
        });
    });
});
