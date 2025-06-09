import { FavoriteField } from '../../models/favorite-field.model';
import { AppDataSource } from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { HttpStatus } from '../../utils/http-status';

export class FavoriteFieldService {
    private favoriteFieldRepository = AppDataSource.getRepository(FavoriteField);

    async addFavoriteField(userId: number, fieldId: number): Promise<FavoriteField> {
        const existingFavorite = await this.favoriteFieldRepository.findOne({
            where: { userId, fieldId },
        });
        if (existingFavorite) {
            throw new ApiError(HttpStatus.CONFLICT, 'El campo ya está en favoritos');
        }
        const favoriteField = new FavoriteField();
        favoriteField.userId = userId;
        favoriteField.fieldId = fieldId;
        return this.favoriteFieldRepository.save(favoriteField);
    }

    async removeFavoriteField(userId: number, fieldId: number): Promise<boolean> {
        const result = await this.favoriteFieldRepository.delete({ userId, fieldId });
        return result.affected ? result.affected > 0 : false;
    }
}
