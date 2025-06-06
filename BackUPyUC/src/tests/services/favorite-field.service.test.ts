import { FavoriteFieldService } from '../../api/services/favorite-field.service';
import { AppDataSource } from '../../config/database';
import { FavoriteField } from '../../models/favorite-field.model';
import { ApiError } from '../../utils/api-error';
import { HttpStatus } from '../../utils/http-status';

// Mock del módulo de base de datos
jest.mock('../../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            findOne: jest.fn(),
            save: jest.fn().mockImplementation(data => Promise.resolve(data)),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            create: jest.fn(),
        })),
    },
}));

describe('FavoriteFieldService', () => {
    let service: FavoriteFieldService;
    let mockRepository: any;

    beforeEach(() => {
        service = new FavoriteFieldService();
        mockRepository = AppDataSource.getRepository(FavoriteField);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addFavoriteField', () => {
        it('debe devolver el campo favorito agregado', async () => {
            const mockFavoriteField = { id: '1', userId: '1', fieldId: '1' };
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.save.mockResolvedValue(mockFavoriteField);
            const result = await service.addFavoriteField('1', '1');
            expect(result).toEqual(mockFavoriteField);
        });

        it('debe lanzar un error si el campo ya está en favoritos', async () => {
            const mockFavoriteField = { id: '1', userId: '1', fieldId: '1' };
            mockRepository.findOne.mockResolvedValue(mockFavoriteField);
            await expect(service.addFavoriteField('1', '1')).rejects.toThrow(
                new ApiError('El campo ya está en favoritos', HttpStatus.CONFLICT)
            );
        });
    });

    describe('removeFavoriteField', () => {
        it('debe devolver true si el campo favorito se elimina correctamente', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 });
            const result = await service.removeFavoriteField('1', '1');
            expect(result).toBe(true);
        });

        it('debe devolver false si el campo favorito no existe', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 });
            const result = await service.removeFavoriteField('1', '1');
            expect(result).toBe(false);
        });
    });
});
