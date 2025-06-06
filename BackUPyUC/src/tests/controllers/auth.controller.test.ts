import { AuthController } from '../../api/controllers/auth.controller';
import { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error';
import { HttpStatus } from '../../utils/http-status';

// Mock del módulo de base de datos
jest.mock('../../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        })),
    },
}));

// Mock de los servicios
jest.mock('../../services/auth.service', () => ({
    AuthService: jest.fn().mockImplementation(() => ({
        login: jest.fn(),
        register: jest.fn(),
        validateToken: jest.fn(),
    })),
}));

jest.mock('../../services/user.service', () => ({
    UserService: jest.fn().mockImplementation(() => ({
        createUser: jest.fn(),
        findByEmail: jest.fn(),
    })),
}));

jest.mock('../../services/password-reset.service', () => ({
    PasswordResetService: jest.fn().mockImplementation(() => ({
        requestPasswordReset: jest.fn(),
        resetPassword: jest.fn(),
    })),
}));

describe('AuthController', () => {
    let controller: AuthController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        controller = new AuthController();
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        req = { body: {} };
        res = { status: statusMock, json: jsonMock } as unknown as Response;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('debe devolver 200 y el usuario/tokens si el login es exitoso', async () => {
            const mockResult = {
                user: {
                    id: '1',
                    name: 'Test User',
                    email: 'test@example.com',
                    roles: ['user'],
                },
                tokens: {
                    accessToken: 'access',
                    refreshToken: 'refresh',
                },
            };
            controller['authService'] = { login: jest.fn().mockResolvedValue(mockResult) } as any;
            req.body = { email: 'test@example.com', password: 'password123' };
            await controller.login(req as Request, res as Response);
            expect(jsonMock).toHaveBeenCalledWith(mockResult);
        });

        it('debe manejar errores de autenticación', async () => {
            controller['authService'] = {
                login: jest
                    .fn()
                    .mockRejectedValue(
                        new ApiError('Credenciales inválidas', HttpStatus.UNAUTHORIZED)
                    ),
            } as any;
            req.body = { email: 'test@example.com', password: 'wrong' };
            await controller.login(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Credenciales inválidas' });
        });
    });

    describe('register', () => {
        it('debe devolver 201 y el usuario si el registro es exitoso', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                roles: ['user'],
            };
            controller['userService'] = {
                createUser: jest.fn().mockResolvedValue(mockUser),
            } as any;
            req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' };
            await controller.register(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Usuario registrado exitosamente',
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                    roles: mockUser.roles,
                },
            });
        });

        it('debe manejar errores de email duplicado', async () => {
            controller['userService'] = {
                createUser: jest
                    .fn()
                    .mockRejectedValue(
                        new ApiError('El email ya está registrado', HttpStatus.CONFLICT)
                    ),
            } as any;
            req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' };
            await controller.register(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(HttpStatus.CONFLICT);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'El email ya está registrado' });
        });
    });
});
