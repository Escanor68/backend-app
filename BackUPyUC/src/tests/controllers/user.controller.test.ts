import { UserController } from '../../api/controllers/user.controller';
import { Request, Response } from 'express';
import { HttpStatus } from '../../utils/http-status';

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
        req = { body: {} };
        res = { status: statusMock, json: jsonMock } as unknown as Response;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('debe devolver 200 y la lista de usuarios', async () => {
            const mockUsers = [
                { id: '1', name: 'Test User', email: 'test@example.com', roles: ['user'] },
            ];
            controller['userService'] = {
                getAllUsers: jest.fn().mockResolvedValue(mockUsers),
            } as any;
            await controller.getUsers(req as Request, res as Response);
            expect(jsonMock).toHaveBeenCalledWith(mockUsers);
        });

        it('debe manejar errores internos', async () => {
            controller['userService'] = {
                getAllUsers: jest.fn().mockRejectedValue(new Error('Error interno')),
            } as any;
            await controller.getUsers(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
        });
    });

    describe('getUserById', () => {
        it('debe devolver 200 y el usuario si existe', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                roles: ['user'],
            };
            controller['userService'] = {
                getUserById: jest.fn().mockResolvedValue(mockUser),
            } as any;
            req.params = { id: '1' };
            await controller.getUserById(req as Request, res as Response);
            expect(jsonMock).toHaveBeenCalledWith(mockUser);
        });

        it('debe devolver 404 si el usuario no existe', async () => {
            controller['userService'] = { getUserById: jest.fn().mockResolvedValue(null) } as any;
            req.params = { id: '1' };
            await controller.getUserById(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
        });
    });

    describe('updateUser', () => {
        it('debe devolver 200 y el usuario actualizado', async () => {
            const mockUser = {
                id: '1',
                name: 'Updated User',
                email: 'test@example.com',
                roles: ['user'],
            };
            controller['userService'] = {
                updateUser: jest.fn().mockResolvedValue(mockUser),
            } as any;
            req.params = { id: '1' };
            req.body = { name: 'Updated User' };
            await controller.updateUser(req as Request, res as Response);
            expect(jsonMock).toHaveBeenCalledWith(mockUser);
        });

        it('debe devolver 404 si el usuario no existe', async () => {
            controller['userService'] = { updateUser: jest.fn().mockResolvedValue(null) } as any;
            req.params = { id: '1' };
            req.body = { name: 'Updated User' };
            await controller.updateUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
        });
    });

    describe('deleteUser', () => {
        it('debe devolver 204 si el usuario se elimina correctamente', async () => {
            controller['userService'] = { deleteUser: jest.fn().mockResolvedValue(true) } as any;
            req.params = { id: '1' };
            await controller.deleteUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
        });

        it('debe devolver 404 si el usuario no existe', async () => {
            controller['userService'] = { deleteUser: jest.fn().mockResolvedValue(false) } as any;
            req.params = { id: '1' };
            await controller.deleteUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
        });
    });
});
