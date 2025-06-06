import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { LoginDto } from '../dto/auth.dto';
import { CreateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import config from '../config';

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
        });

        return this.userRepository.save(user);
    }

    async validateToken(token: string): Promise<User> {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
            const user = await this.userRepository.findOne({
                where: { id: decoded.id },
                select: ['id', 'email', 'roles', 'isBlocked'],
            });

            if (!user) {
                throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            if (user.isBlocked) {
                throw new ApiError('Usuario bloqueado', HttpStatus.FORBIDDEN);
            }

            return user;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token inválido', HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    async refreshToken(
        refreshToken: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };
            const user = await this.userRepository.findOne({
                where: { id: decoded.id },
                select: ['id', 'email', 'roles', 'isBlocked'],
            });

            if (!user) {
                throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }

            if (user.isBlocked) {
                throw new ApiError('Usuario bloqueado', HttpStatus.FORBIDDEN);
            }

            return this.generateTokens(user);
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token de refresco inválido', HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    async logout(_userId: string): Promise<void> {
        // En una implementación real, podrías invalidar el token de refresco
        // o agregarlo a una lista negra
        return;
    }

    private generateTokens(user: User): { accessToken: string; refreshToken: string } {
        const payload = { id: user.id };
        const accessToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.accessExpiration,
        } as jwt.SignOptions);

        const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiration,
        } as jwt.SignOptions);

        return { accessToken, refreshToken };
    }
}
