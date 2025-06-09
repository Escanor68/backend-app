import { AuthController } from '../../api/controllers/auth.controller';
import { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error';
import { HttpStatus } from '../../utils/http-status';
import { UserRole } from '../../types/user.types';

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

    describe('login', () => {
        it('debe devolver un token JWT al iniciar sesión correctamente', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                roles: [UserRole.USER],
            };
            const mockToken = 'mock.jwt.token';

            controller['authService'] = {
                login: jest.fn().mockResolvedValue({ user: mockUser, token: mockToken }),
            } as any;

            req.body = { email: 'test@example.com', password: 'password123' };

            await controller.login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith({
                user: mockUser,
                token: mockToken,
            });
        });

        it('debe devolver 401 si las credenciales son inválidas', async () => {
            controller['authService'] = {
                login: jest.fn().mockRejectedValue(new Error('Credenciales inválidas')),
            } as any;

            req.body = { email: 'test@example.com', password: 'wrongpassword' };

            await controller.login(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Credenciales inválidas',
            });
        });
    });

    describe('register', () => {
        it('debe registrar un nuevo usuario correctamente', async () => {
            const mockUser = {
                id: 1,
                email: 'new@example.com',
                roles: [UserRole.USER],
            };

            controller['authService'] = {
                register: jest.fn().mockResolvedValue(mockUser),
            } as any;

            req.body = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            await controller.register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(jsonMock).toHaveBeenCalledWith(mockUser);
        });

        it('debe devolver 400 si el email ya está registrado', async () => {
            controller['authService'] = {
                register: jest.fn().mockRejectedValue(new Error('El email ya está registrado')),
            } as any;

            req.body = {
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            await controller.register(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'El email ya está registrado',
            });
        });
    });

    describe('forgotPassword', () => {
        it('debe enviar un email de recuperación', async () => {
            controller['authService'] = {
                forgotPassword: jest.fn().mockResolvedValue(undefined),
            } as any;

            req.body = { email: 'test@example.com' };

            await controller.forgotPassword(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Se ha enviado un email con instrucciones para recuperar la contraseña',
            });
        });
    });

    describe('resetPassword', () => {
        it('debe restablecer la contraseña correctamente', async () => {
            controller['authService'] = {
                resetPassword: jest.fn().mockResolvedValue(undefined),
            } as any;

            req.body = {
                token: 'valid-token',
                password: 'password123',
            };

            await controller.resetPassword(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Contraseña restablecida correctamente',
            });
        });

        it('debe devolver 400 si el token es inválido', async () => {
            controller['authService'] = {
                resetPassword: jest.fn().mockRejectedValue(new Error('Token inválido')),
            } as any;

            req.body = {
                token: 'invalid-token',
                password: 'password123',
            };

            await controller.resetPassword(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Token inválido',
            });
        });
    });
});
