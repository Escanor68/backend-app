import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { ApiError } from '../../utils/api-error';
import { HttpStatus } from '../../utils/http-status';

// Mock del módulo de base de datos
jest.mock('../../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            findOne: jest.fn(),
        })),
    },
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(() => ({ id: '1' })),
    JsonWebTokenError: class extends Error {},
}));

describe('authMiddleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let mockUser: any;

    beforeEach(() => {
        req = {
            headers: {
                authorization: 'Bearer valid-token',
            },
        };
        res = {};
        next = jest.fn();
        mockUser = {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedPassword',
            phone: null,
            roles: ['user'],
            preferredLocation: null,
            notificationPreferences: { email: true, push: true, sms: false },
            isBlocked: false,
            favoriteFields: [],
            notifications: [],
            passwordResetTokens: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debe establecer req.user si el token es válido', async () => {
        const userRepository = require('../../config/database').AppDataSource.getRepository();
        userRepository.findOne.mockResolvedValue(mockUser);
        await authMiddleware(req as Request, res as Response, next);
        expect(req.user).toEqual({
            id: mockUser.id,
            email: mockUser.email,
            roles: mockUser.roles,
        });
        expect(next).toHaveBeenCalled();
    });

    it('debe llamar next con error si no hay token', async () => {
        req.headers = {};
        await authMiddleware(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('debe llamar next con error si el token es inválido', async () => {
        const userRepository = require('../../config/database').AppDataSource.getRepository();
        userRepository.findOne.mockRejectedValue(
            new ApiError('Token inválido', HttpStatus.UNAUTHORIZED)
        );
        await authMiddleware(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('debe llamar next con error si el formato del token es inválido', async () => {
        req.headers = { authorization: 'InvalidFormat' };
        await authMiddleware(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    });
});
