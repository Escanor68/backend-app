import { FavoriteFieldController } from '../../api/controllers/favorite-field.controller';
import { Request, Response } from 'express';
import { HttpStatus } from '../../utils/http-status';
import { UserRole } from '../../types/user.types';

// Mock del módulo de base de datos
jest.mock('../../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        })),
    },
}));

describe('FavoriteFieldController', () => {
    let controller: FavoriteFieldController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        controller = new FavoriteFieldController();
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

    describe('addFavoriteField', () => {
        it('debe devolver 201 y el campo favorito agregado', async () => {
            const mockFavoriteField = { id: 1, userId: 1, fieldId: 1 };
            controller['favoriteFieldService'] = {
                addFavoriteField: jest.fn().mockResolvedValue(mockFavoriteField),
            } as any;
            req.body = { fieldId: 1 };
            await controller.addFavoriteField(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(jsonMock).toHaveBeenCalledWith(mockFavoriteField);
        });

        it('debe devolver 401 si el usuario no está autenticado', async () => {
            req.user = undefined;
            req.body = { fieldId: 1 };
            await controller.addFavoriteField(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Usuario no autenticado' });
        });
    });

    describe('removeFavoriteField', () => {
        it('debe devolver 204 si el campo favorito se elimina correctamente', async () => {
            controller['favoriteFieldService'] = {
                removeFavoriteField: jest.fn().mockResolvedValue(true),
            } as any;
            req.params = { fieldId: '1' };
            await controller.removeFavoriteField(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
        });

        it('debe devolver 404 si el campo favorito no existe', async () => {
            controller['favoriteFieldService'] = {
                removeFavoriteField: jest.fn().mockResolvedValue(false),
            } as any;
            req.params = { fieldId: '1' };
            await controller.removeFavoriteField(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Campo favorito no encontrado' });
        });

        it('debe devolver 401 si el usuario no está autenticado', async () => {
            req.user = undefined;
            req.params = { fieldId: '1' };
            await controller.removeFavoriteField(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Usuario no autenticado' });
        });
    });
});
