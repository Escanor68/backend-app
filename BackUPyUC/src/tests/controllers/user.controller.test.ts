import { UserController } from '../../api/controllers/user.controller';
import { Request, Response } from 'express';
import { HttpStatus } from '../../utils/http-status';
import { UserRole } from '../../types/user.types';

// Mock del módulo de base de datos
jest.mock('../../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        })),
    },
}));

describe('UserController', () => {
    let controller: UserController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        controller = new UserController();
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        req = {
            body: {},
            user: {
                id: 1,
                email: 'test@example.com',
                roles: [UserRole.USER],
            },
        };
        res = { status: statusMock, json: jsonMock } as unknown as Response;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getCurrentUser', () => {
        it('debe devolver el usuario actual', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                roles: [UserRole.USER],
            };

            controller['userService'] = {
                getUserById: jest.fn().mockResolvedValue(mockUser),
            } as any;

            await controller.getCurrentUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith(mockUser);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.getCurrentUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('updateUser', () => {
        it('debe actualizar el usuario correctamente', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                roles: [UserRole.USER],
            };

            controller['userService'] = {
                updateUser: jest.fn().mockResolvedValue(mockUser),
            } as any;

            req.body = {
                email: 'updated@example.com',
            };

            await controller.updateUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith(mockUser);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.updateUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('changePassword', () => {
        it('debe cambiar la contraseña correctamente', async () => {
            controller['userService'] = {
                changePassword: jest.fn().mockResolvedValue(undefined),
            } as any;

            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword',
            };

            await controller.changePassword(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Contraseña actualizada correctamente',
            });
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.changePassword(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('getFavoriteFields', () => {
        it('debe devolver los campos favoritos del usuario', async () => {
            const mockFields = [
                {
                    id: 1,
                    userId: 1,
                    fieldId: 1,
                },
            ];

            controller['userService'] = {
                getFavoriteFields: jest.fn().mockResolvedValue(mockFields),
            } as any;

            await controller.getFavoriteFields(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith(mockFields);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.getFavoriteFields(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('addFavoriteField', () => {
        it('debe agregar un campo a favoritos', async () => {
            controller['userService'] = {
                addFavoriteField: jest.fn().mockResolvedValue(undefined),
            } as any;

            req.body = {
                fieldId: 1,
            };

            await controller.addFavoriteField(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Campo agregado a favoritos',
            });
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.addFavoriteField(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('removeFavoriteField', () => {
        it('debe eliminar un campo de favoritos', async () => {
            controller['userService'] = {
                removeFavoriteField: jest.fn().mockResolvedValue(undefined),
            } as any;

            req.params = {
                fieldId: '1',
            };

            await controller.removeFavoriteField(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.removeFavoriteField(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('getNotifications', () => {
        it('debe devolver las notificaciones del usuario', async () => {
            const mockNotifications = [
                {
                    id: 1,
                    userId: 1,
                    message: 'Test notification',
                    isRead: false,
                },
            ];

            controller['userService'] = {
                getNotifications: jest.fn().mockResolvedValue(mockNotifications),
            } as any;

            await controller.getNotifications(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith(mockNotifications);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.getNotifications(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('markNotificationAsRead', () => {
        it('debe marcar una notificación como leída', async () => {
            controller['userService'] = {
                markNotificationAsRead: jest.fn().mockResolvedValue(undefined),
            } as any;

            req.params = {
                id: '1',
            };

            await controller.markNotificationAsRead(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.markNotificationAsRead(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('getAllUsers', () => {
        it('debe devolver todos los usuarios', async () => {
            const mockUsers = [
                {
                    id: 1,
                    email: 'test@example.com',
                    roles: [UserRole.USER],
                },
            ];

            controller['userService'] = {
                getAllUsers: jest.fn().mockResolvedValue(mockUsers),
            } as any;

            await controller.getAllUsers(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith(mockUsers);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.getAllUsers(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });
    });

    describe('blockUser', () => {
        it('debe bloquear un usuario', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                roles: [UserRole.USER],
                isBlocked: true,
            };

            controller['userService'] = {
                blockUser: jest.fn().mockResolvedValue(mockUser),
            } as any;

            req.params = {
                id: '1',
            };

            await controller.blockUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith(mockUser);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.blockUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });

        it('debe devolver 400 si el ID es inválido', async () => {
            req.params = {
                id: 'invalid',
            };

            await controller.blockUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'ID de usuario inválido',
            });
        });
    });

    describe('unblockUser', () => {
        it('debe desbloquear un usuario', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                roles: [UserRole.USER],
                isBlocked: false,
            };

            controller['userService'] = {
                unblockUser: jest.fn().mockResolvedValue(mockUser),
            } as any;

            req.params = {
                id: '1',
            };

            await controller.unblockUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith(mockUser);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.unblockUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });

        it('debe devolver 400 si el ID es inválido', async () => {
            req.params = {
                id: 'invalid',
            };

            await controller.unblockUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'ID de usuario inválido',
            });
        });
    });

    describe('updateRoles', () => {
        it('debe actualizar los roles de un usuario', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                roles: [UserRole.ADMIN],
            };

            controller['userService'] = {
                updateRoles: jest.fn().mockResolvedValue(mockUser),
            } as any;

            req.params = {
                id: '1',
            };
            req.body = {
                roles: [UserRole.ADMIN],
            };

            await controller.updateRoles(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith(mockUser);
        });

        it('debe devolver 401 si no hay usuario autenticado', async () => {
            req.user = undefined;

            await controller.updateRoles(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario no autenticado',
            });
        });

        it('debe devolver 400 si el ID es inválido', async () => {
            req.params = {
                id: 'invalid',
            };

            await controller.updateRoles(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'ID de usuario inválido',
            });
        });
    });
});
