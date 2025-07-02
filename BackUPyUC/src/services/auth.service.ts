import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { LoginDto } from '../dto/auth.dto';
import { CreateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRole, UserData, LoginResult } from '../types/user.types';
import { TokenBlacklistService } from './token-blacklist.service';

interface JwtPayload {
    userId: string;
}

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private tokenBlacklistService = new TokenBlacklistService();

    async login(loginData: LoginDto): Promise<LoginResult> {
        const user = await this.userRepository.findOne({
            where: { email: loginData.email },
            select: [
                'id',
                'email',
                'password',
                'roles',
                'isBlocked',
                'name',
                'createdAt',
                'updatedAt',
            ],
        });

        if (!user) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Credenciales inválidas');
        }

        if (user.isBlocked) {
            throw new ApiError(HttpStatus.FORBIDDEN, 'Usuario bloqueado');
        }

        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Credenciales inválidas');
        }

        const tokens = this.generateTokens(user);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            tokens,
        };
    }

    async register(userData: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new ApiError(HttpStatus.CONFLICT, 'El email ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
            roles: userData.roles ? userData.roles.map(r => r as UserRole) : [UserRole.USER],
        });

        return this.userRepository.save(user);
    }

    async validateToken(token: string): Promise<UserData> {
        try {
            // Verificar si el token está en la lista negra
            const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
            if (isBlacklisted) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token invalidado');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
            const user = await this.userRepository.findOne({ where: { id: decoded.userId } });
            if (!user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no encontrado');
            }
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
        } catch (error) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token inválido');
        }
    }

    async getProfile(userId: string): Promise<UserData> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Usuario no encontrado');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async refreshToken(refreshToken: string): Promise<LoginResult> {
        try {
            // Verificar si el refresh token está en la lista negra
            const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(refreshToken);
            if (isBlacklisted) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Refresh token invalidado');
            }

            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as JwtPayload;
            const user = await this.userRepository.findOne({ where: { id: decoded.userId } });
            if (!user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no encontrado');
            }
            const tokens = this.generateTokens(user);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles,
                    isBlocked: user.isBlocked,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                tokens,
            };
        } catch (error) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token de refresco inválido');
        }
    }

    async logout(userId: string, accessToken?: string, refreshToken?: string): Promise<void> {
        try {
            // Agregar tokens a la lista negra si se proporcionan
            if (accessToken) {
                await this.tokenBlacklistService.addToBlacklist(accessToken, userId, 'logout');
            }
            if (refreshToken) {
                await this.tokenBlacklistService.addToBlacklist(refreshToken, userId, 'logout');
            }

            console.log(`🚪 [AuthService] Usuario ${userId} ha cerrado sesión`);
        } catch (error) {
            console.error('❌ [AuthService] Error en logout:', error);
            throw error;
        }
    }

    async logoutAllSessions(userId: string): Promise<void> {
        try {
            // Obtener todos los tokens del usuario y agregarlos a la lista negra
            const userTokens = await this.tokenBlacklistService.getBlacklistedTokensByUser(userId);

            // Aquí podrías implementar lógica adicional para invalidar todos los tokens activos
            // Por ejemplo, mantener un registro de tokens activos por usuario

            console.log(`🚪 [AuthService] Usuario ${userId} ha cerrado todas las sesiones`);
        } catch (error) {
            console.error('❌ [AuthService] Error cerrando todas las sesiones:', error);
            throw error;
        }
    }

    private generateTokens(user: User): { accessToken: string; refreshToken: string } {
        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
            expiresIn: '15m',
        });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
}
