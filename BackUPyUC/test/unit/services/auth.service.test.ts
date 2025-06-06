import { AuthService } from '../../../src/services/auth.service';
import { User } from '../../../src/models/user.model';
import { ApiError } from '../../../src/utils/api-error';
import { HttpStatus } from '../../../src/utils/http-status';

jest.mock('../../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        })),
    },
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mocked.jwt.token'),
    verify: jest.fn(() => ({ id: '1' })),
    JsonWebTokenError: class extends Error {},
}));

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: any;
    let mockUser: User;

    beforeEach(() => {
        authService = new AuthService();
        userRepository = require('../../config/database').AppDataSource.getRepository();
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
        } as unknown as User;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('debe devolver usuario y tokens si las credenciales son válidas', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            require('bcrypt').compare.mockResolvedValue(true);

            const result = await authService.login({
                email: mockUser.email,
                password: 'password123',
            });
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('tokens');
            expect(result.tokens).toHaveProperty('accessToken');
            expect(result.tokens).toHaveProperty('refreshToken');
        });

        it('debe lanzar error si el usuario no existe', async () => {
            userRepository.findOne.mockResolvedValue(null);
            await expect(
                authService.login({ email: 'no@existe.com', password: 'pass' })
            ).rejects.toThrow(ApiError);
        });

        it('debe lanzar error si el usuario está bloqueado', async () => {
            userRepository.findOne.mockResolvedValue({
                ...mockUser,
                isBlocked: true,
            });
            await expect(
                authService.login({ email: mockUser.email, password: 'pass' })
            ).rejects.toThrow(ApiError);
        });

        it('debe lanzar error si la contraseña es incorrecta', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            require('bcrypt').compare.mockResolvedValue(false);
            await expect(
                authService.login({ email: mockUser.email, password: 'wrong' })
            ).rejects.toThrow(ApiError);
        });
    });

    describe('register', () => {
        it('debe crear y devolver un nuevo usuario', async () => {
            userRepository.findOne.mockResolvedValue(null);
            require('bcrypt').hash.mockResolvedValue('hashedPassword');
            userRepository.create.mockReturnValue(mockUser);
            userRepository.save.mockResolvedValue(mockUser);

            const result = await authService.register({
                name: 'Test User',
                email: 'nuevo@ejemplo.com',
                password: 'password123',
            });
            expect(result).toEqual(mockUser);
        });

        it('debe lanzar error si el email ya está registrado', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            await expect(
                authService.register({
                    name: 'Test User',
                    email: mockUser.email,
                    password: 'password123',
                })
            ).rejects.toThrow(ApiError);
        });
    });

    describe('validateToken', () => {
        it('debe devolver el usuario si el token es válido', async () => {
            userRepository.findOne.mockResolvedValue(mockUser);
            const result = await authService.validateToken('mocked.jwt.token');
            expect(result).toEqual(mockUser);
        });

        it('debe lanzar error si el usuario no existe', async () => {
            userRepository.findOne.mockResolvedValue(null);
            await expect(authService.validateToken('mocked.jwt.token')).rejects.toThrow(ApiError);
        });
    });
});
