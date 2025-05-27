import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../core/services/userService';
import { AuthRequest } from '../../middleware/authMiddleware';
import { validateUpdateUserInput } from '../validators/user.validator';
import { validateUpdateProfileInput } from '../validators/user.validator';
import { HttpStatus } from '../../core/constants';
import { ApiError } from '../../core/errors/api.error';

export class UserController {
    constructor(private userService: UserService) {}

    public getProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const profile = await this.userService.getProfile(userId);
            res.status(HttpStatus.OK).json(profile);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.status).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }
        }
    };

    public updateProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const { error, value } = validateUpdateProfileInput(req.body);
            if (error) {
                throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
            }

            const userId = req.user.id;
            const updatedProfile = await this.userService.updateProfile(userId, value);
            res.status(HttpStatus.OK).json(updatedProfile);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.status).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }
        }
    };

    public getBookings = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const bookings = await this.userService.getUserBookings(userId);
            res.status(HttpStatus.OK).json(bookings);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.status).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }
        }
    };

    public getFavorites = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const favorites = await this.userService.getUserFavorites(userId);
            res.status(HttpStatus.OK).json(favorites);
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.status).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }
        }
    };

    public addFavorite = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const fieldId = req.params.fieldId;
            await this.userService.addFavorite(userId, fieldId);
            res.status(HttpStatus.OK).json({ message: 'Field added to favorites successfully' });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.status).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }
        }
    };

    public removeFavorite = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user.id;
            const fieldId = req.params.fieldId;
            await this.userService.removeFavorite(userId, fieldId);
            res.status(HttpStatus.OK).json({ message: 'Field removed from favorites successfully' });
        } catch (error) {
            if (error instanceof ApiError) {
                res.status(error.status).json({ message: error.message });
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }
        }
    };

    public getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await UserService.findAll();
            const usersWithoutPasswords = users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            
            res.json(usersWithoutPasswords);
        } catch (error) {
            next(error);
        }
    }

    public createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = await validateUpdateUserInput(req.body);
            const newUser = await UserService.create(userData);
            
            const { password, ...userWithoutPassword } = newUser;
            res.status(201).json(userWithoutPassword);
        } catch (error) {
            next(error);
        }
    }

    public updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userData = await validateUpdateUserInput(req.body);
            const updatedUser = await UserService.update(id, userData);
            
            const { password, ...userWithoutPassword } = updatedUser;
            res.json(userWithoutPassword);
        } catch (error) {
            next(error);
        }
    }

    public deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await UserService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
} 