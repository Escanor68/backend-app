import { FavoriteField } from '../../models/favorite-field.model';
import { AppDataSource } from '../../config/database';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';

export class FavoriteFieldService {
    private favoriteFieldRepository = AppDataSource.getRepository(FavoriteField);

    async addFavoriteField(userId: string, fieldId: string): Promise<FavoriteField> {
        const existingFavorite = await this.favoriteFieldRepository.findOne({
            where: { userId, fieldId },
        });
        if (existingFavorite) {
            throw new ApiError('El campo ya está en favoritos', HttpStatus.CONFLICT);
        }
        const favoriteField = new FavoriteField();
        favoriteField.userId = userId;
        favoriteField.fieldId = fieldId;
        return this.favoriteFieldRepository.save(favoriteField);
    }

    async removeFavoriteField(userId: string, fieldId: string): Promise<boolean> {
        const result = await this.favoriteFieldRepository.delete({ userId, fieldId });
        return result.affected ? result.affected > 0 : false;
    }
}
