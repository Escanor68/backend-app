import { UserService } from '../../api/services/user.service';
import { AppDataSource } from '../../config/database';
import { User } from '../../models/user.model';

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

describe('UserService', () => {
    let service: UserService;
    let mockRepository: any;

    beforeEach(() => {
        service = new UserService();
        mockRepository = AppDataSource.getRepository(User);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('debe devolver la lista de usuarios', async () => {
            const mockUsers = [
                { id: '1', name: 'Test User', email: 'test@example.com', roles: ['user'] },
            ];
            mockRepository.find.mockResolvedValue(mockUsers);
            const result = await service.getAllUsers();
            expect(result).toEqual(mockUsers);
        });
    });

    describe('getUserById', () => {
        it('debe devolver el usuario si existe', async () => {
            const mockUser = {
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                roles: ['user'],
            };
            mockRepository.findOne.mockResolvedValue(mockUser);
            const result = await service.getUserById('1');
            expect(result).toEqual(mockUser);
        });

        it('debe devolver null si el usuario no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const result = await service.getUserById('1');
            expect(result).toBeNull();
        });
    });

    describe('updateUser', () => {
        it('debe devolver el usuario actualizado', async () => {
            const mockUser = {
                id: '1',
                name: 'Updated User',
                email: 'test@example.com',
                roles: ['user'],
            };
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);
            const result = await service.updateUser('1', { name: 'Updated User' });
            expect(result).toEqual(mockUser);
        });

        it('debe devolver null si el usuario no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const result = await service.updateUser('1', { name: 'Updated User' });
            expect(result).toBeNull();
        });
    });

    describe('deleteUser', () => {
        it('debe devolver true si el usuario se elimina correctamente', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            const result = await service.deleteUser('1');
            expect(result).toBe(true);
        });

        it('debe devolver false si el usuario no existe', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 });
            const result = await service.deleteUser('1');
            expect(result).toBe(false);
        });

        it('debe manejar errores al eliminar el usuario', async () => {
            mockRepository.delete.mockRejectedValue(new Error('Error al eliminar usuario'));
            await expect(service.deleteUser('1')).rejects.toThrow('Error al eliminar usuario');
        });
    });
});
