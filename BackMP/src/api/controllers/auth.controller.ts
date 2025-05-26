import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../core/services/authService';
import { validateLoginInput, validateRegisterInput } from '../validators/auth.validator';

export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = await validateLoginInput(req.body);
            const result = await AuthService.login(email, password);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = await validateRegisterInput(req.body);
            const result = await AuthService.register(userData);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { oldPassword, newPassword } = req.body;
            const userId = (req as any).user.id;
            
            await AuthService.changePassword(userId, oldPassword, newPassword);
            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            next(error);
        }
    }
} 