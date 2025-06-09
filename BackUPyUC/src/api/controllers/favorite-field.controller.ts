import { Request, Response } from 'express';
import { FavoriteFieldService } from '../services/favorite-field.service';
import { ApiError } from '../../utils/api-error';
import { HttpStatus } from '../../utils/http-status';

export class FavoriteFieldController {
    private favoriteFieldService: FavoriteFieldService;

    constructor() {
        this.favoriteFieldService = new FavoriteFieldService();
    }

    async addFavoriteField(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }

            const userId = req.user.id;
            const fieldId = parseInt(req.body.fieldId);

            if (isNaN(fieldId)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, 'ID de campo inválido');
            }

            const favoriteField = await this.favoriteFieldService.addFavoriteField(userId, fieldId);

            res.status(HttpStatus.CREATED).json(favoriteField);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }

    async removeFavoriteField(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }

            const userId = req.user.id;
            const fieldId = parseInt(req.params.fieldId);

            if (isNaN(fieldId)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, 'ID de campo inválido');
            }

            const success = await this.favoriteFieldService.removeFavoriteField(userId, fieldId);

            if (!success) {
                throw new ApiError(HttpStatus.NOT_FOUND, 'Campo favorito no encontrado');
            }

            res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: 'Error interno del servidor',
                });
            }
        }
    }
}
