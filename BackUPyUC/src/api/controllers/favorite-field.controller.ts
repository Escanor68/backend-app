import { Request, Response } from 'express';
import { FavoriteFieldService } from '../services/favorite-field.service';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';

export class FavoriteFieldController {
    private favoriteFieldService: FavoriteFieldService;

    constructor() {
        this.favoriteFieldService = new FavoriteFieldService();
    }

    async addFavoriteField(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { fieldId } = req.body;
            const favoriteField = await this.favoriteFieldService.addFavoriteField(userId, fieldId);
            return res.status(HttpStatus.CREATED).json(favoriteField);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error interno del servidor' });
        }
    }

    async removeFavoriteField(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
            }
            const { fieldId } = req.params;
            const removed = await this.favoriteFieldService.removeFavoriteField(userId, fieldId);
            if (!removed) {
                throw new ApiError('Campo favorito no encontrado', HttpStatus.NOT_FOUND);
            }
            return res.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error interno del servidor' });
        }
    }
}
