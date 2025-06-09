import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config';
import { AppDataSource } from '../../config/database';
import { User } from '../../models/user.model';
import { ApiError } from '../../core/errors/api.error';
import { HttpStatus } from '../../core/constants';
import { UserData, UserRole, LoginResult } from '../../types/user.types';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/auth.dto';
import { CreateUserDto } from '../../dto/user.dto';
import { JwtPayload } from 'jsonwebtoken';

interface TokenPayload {
    userId: number;
}

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        console.log('🏗️ [AuthService] Inicializando AuthService...');
        console.log('✅ [AuthService] AuthService inicializado correctamente');
    }

    private generateToken(userId: number, options?: jwt.SignOptions): string {
        const payload: TokenPayload = { userId };
        return jwt.sign(payload, config.jwt.secret, {
            ...config.jwt.options,
            ...options,
        });
    }

    private verifyToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, config.jwt.secret) as TokenPayload;
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
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

    async getProfile(userId: number): Promise<UserData> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            notificationPreferences: user.notificationPreferences,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async updateProfile(userId: number, data: Partial<UserData>): Promise<UserData> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        Object.assign(user, data);
        await this.userRepository.save(user);

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            notificationPreferences: user.notificationPreferences,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user || !(await user.comparePassword(currentPassword))) {
            throw new ApiError('Contraseña actual incorrecta', HttpStatus.UNAUTHORIZED);
        }

        user.password = newPassword;
        await this.userRepository.save(user);

        return { message: 'Contraseña actualizada exitosamente' };
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        const resetToken = this.generateToken(user.id, { expiresIn: '1h' });
        user.resetToken = resetToken;
        await this.userRepository.save(user);

        // TODO: Implementar envío de email con el token

        return {
            message: 'Se ha enviado un email con instrucciones para restablecer la contraseña',
        };
    }

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const payload = this.verifyToken(token);
        const user = await this.userRepository.findOne({ where: { id: payload.userId } });

        if (!user || user.resetToken !== token) {
            throw new ApiError('Token inválido o expirado', HttpStatus.BAD_REQUEST);
        }

        user.password = newPassword;
        user.resetToken = undefined;
        await this.userRepository.save(user);

        return { message: 'Contraseña restablecida exitosamente' };
    }

    async validateToken(token: string): Promise<UserData> {
        try {
            const payload = this.verifyToken(token);
            const user = await this.userRepository.findOneBy({ id: payload.userId });

            if (!user) {
                throw new ApiError('Usuario no encontrado', HttpStatus.UNAUTHORIZED);
            }

            if (user.isBlocked) {
                throw new ApiError('Usuario bloqueado', HttpStatus.FORBIDDEN);
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                notificationPreferences: user.notificationPreferences,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
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
            // Verificar el token de refresco
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;

            // Buscar el usuario
            const user = await this.userRepository.findOne({
                where: { id: decoded.userId },
                select: [
                    'id',
                    'email',
                    'name',
                    'roles',
                    'isBlocked',
                    'notificationPreferences',
                    'createdAt',
                    'updatedAt',
                ],
            });

            if (!user) {
                throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            // Verificar que el usuario no esté bloqueado
            if (user.isBlocked) {
                throw new ApiError('Usuario bloqueado', HttpStatus.FORBIDDEN);
            }

            // Generar nuevos tokens
            const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles,
                    notificationPreferences: user.notificationPreferences,
                    isBlocked: user.isBlocked,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token: accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token de refresco inválido', HttpStatus.UNAUTHORIZED);
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new ApiError('Token de refresco expirado', HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    private generateTokens(user: User): { accessToken: string; refreshToken: string } {
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, roles: user.roles },
            config.jwt.secret as string,
            { expiresIn: config.jwt.expiresIn as string } as SignOptions
        );
        const refreshToken = jwt.sign(
            { id: user.id },
            config.jwt.refreshSecret as string,
            { expiresIn: config.jwt.refreshExpiresIn as string } as SignOptions
        );
        return { accessToken, refreshToken };
    }
}
