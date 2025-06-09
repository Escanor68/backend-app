import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async getUsers(_: Request, res: Response): Promise<Response> {
        try {
            const users = await this.userService.getAllUsers();
            return res.json(users);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error interno del servidor' });
        }
    }

    async getUserById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(Number(id));
            if (!user) {
                throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }
            return res.json(user);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error interno del servidor' });
        }
    }

    async updateUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const userData = req.body;
            const updatedUser = await this.userService.updateUser(Number(id), userData);
            if (!updatedUser) {
                throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }
            return res.json(updatedUser);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error interno del servidor' });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const deleted = await this.userService.deleteUser(Number(id));
            if (!deleted) {
                throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
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
