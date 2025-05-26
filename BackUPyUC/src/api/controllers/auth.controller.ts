import { Request, Response, NextFunction } from 'express';
import { AuthService, UserCredentials } from '../../core/services/authService';
import { validateLoginInput, validateRegisterInput } from '../validators/auth.validator';
import { UserService } from '../../core/services/userService';

export class AuthController {
    public static async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Validar input
            const credentials = await validateLoginInput(req.body);
            
            // Buscar usuario
            const user = await UserService.findByEmail(credentials.email);
            
            // Validar credenciales
            await AuthService.validateCredentials(credentials, user);
            
            // Generar token
            const token = AuthService.generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });
            
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public static async register(req: Request, res: Response, next: NextFunction) {
        try {
            // Validar input
            const userData = await validateRegisterInput(req.body);
            
            // Verificar si el email ya existe
            const existingUser = await UserService.findByEmail(userData.email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            
            // Hash password
            const hashedPassword = await AuthService.hashPassword(userData.password);
            
            // Crear usuario
            const user = await UserService.create({
                ...userData,
                password: hashedPassword,
                role: 'user' // Role por defecto
            });
            
            // Generar token
            const token = AuthService.generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });
            
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    public static async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = AuthService.verifyToken(token);
            const user = await UserService.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            const newToken = AuthService.generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });

            res.json({ token: newToken });
        } catch (error) {
            next(error);
        }
    }
} 