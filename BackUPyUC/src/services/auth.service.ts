import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { LoginDto } from '../dto/auth.dto';
import { CreateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedUser, UserRole, LoginResult } from '../types/user.types';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    async login(
        loginData: LoginDto
    ): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
        const user = await this.userRepository.findOne({
            where: { email: loginData.email },
            select: ['id', 'email', 'password', 'roles', 'isBlocked'],
        });

        if (!user) {
            throw new ApiError('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
        }

        if (user.isBlocked) {
            throw new ApiError('Usuario bloqueado', HttpStatus.FORBIDDEN);
        }

        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new ApiError('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
        }

        const tokens = this.generateTokens(user);
        return { user, tokens };
    }

    async register(userData: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new ApiError('El email ya está registrado', HttpStatus.CONFLICT);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
            roles: userData.roles ? userData.roles.map(r => r as UserRole) : [UserRole.USER],
        });

        return this.userRepository.save(user);
    }

    async validateToken(token: string): Promise<AuthenticatedUser> {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as {
                id: number;
                email: string;
                roles: string[];
            };
            const user = await this.userRepository.findOne({
                where: { id: decoded.id },
                select: ['id', 'email', 'roles', 'isBlocked'],
            });

            if (!user) {
                throw new ApiError('Usuario no encontrado', HttpStatus.UNAUTHORIZED);
            }

            if (user.isBlocked) {
                throw new ApiError('Usuario bloqueado', HttpStatus.FORBIDDEN);
            }

            return {
                id: user.id,
                email: user.email,
                roles: user.roles,
            };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token inválido', HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<LoginResult> {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: number };
            const user = await this.userRepository.findOne({
                where: { id: decoded.id },
                select: ['id', 'email', 'name', 'roles', 'isBlocked'],
            });

            if (!user) {
                throw new ApiError('Usuario no encontrado', HttpStatus.UNAUTHORIZED);
            }

            if (user.isBlocked) {
                throw new ApiError('Usuario bloqueado', HttpStatus.FORBIDDEN);
            }

            const tokens = this.generateTokens(user);

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles,
                    isBlocked: user.isBlocked,
                    notificationPreferences: {
                        email: true,
                        push: true,
                        sms: false,
                    },
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token inválido', HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    async logout(_userId: number): Promise<void> {
        // En una implementación real, podrías invalidar el token de refresco
        // o agregarlo a una lista negra
        return;
    }

    private generateTokens(user: User): { accessToken: string; refreshToken: string } {
        const payload: AuthenticatedUser = {
            id: user.id,
            email: user.email,
            roles: user.roles,
        };

        const accessToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        } as jwt.SignOptions);

        const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn,
        } as jwt.SignOptions);

        return { accessToken, refreshToken };
    }
}
