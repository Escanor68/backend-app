import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../core/services/userService';
import { AuthRequest } from '../../middleware/authMiddleware';
import { validateUpdateUserInput } from '../validators/user.validator';

export class UserController {
    public static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await UserService.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            next(error);
        }
    }

    public static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userData = await validateUpdateUserInput(req.body);
            const updatedUser = await UserService.update(req.user.id, userData);
            
            const { password, ...userWithoutPassword } = updatedUser;
            res.json(userWithoutPassword);
        } catch (error) {
            next(error);
        }
    }

    public static async getAllUsers(req: Request, res: Response, next: NextFunction) {
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

    public static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = await validateUpdateUserInput(req.body);
            const newUser = await UserService.create(userData);
            
            const { password, ...userWithoutPassword } = newUser;
            res.status(201).json(userWithoutPassword);
        } catch (error) {
            next(error);
        }
    }

    public static async updateUser(req: Request, res: Response, next: NextFunction) {
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

    public static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await UserService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
} 