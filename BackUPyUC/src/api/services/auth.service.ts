import jwt from 'jsonwebtoken';
import config from '../../config';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { LoginDto } from '../dto/auth.dto';

export interface LoginResult {
    user: {
        id: string;
        email: string;
        name: string;
        roles: string[];
    };
    accessToken: string;
    refreshToken: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private prtRepository = AppDataSource.getRepository(PasswordResetToken);

    constructor() {
        console.log('🏗️ [AuthService] Inicializando AuthService...');
        console.log('✅ [AuthService] AuthService inicializado correctamente');
    }

    async login(loginData: LoginDto): Promise<LoginResult> {
        const { email, password } = loginData;
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'name', 'roles', 'isBlocked'],
        });

        if (!user) {
            throw new ApiError('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
        }

        if (user.isBlocked) {
            throw new ApiError('Usuario bloqueado', HttpStatus.FORBIDDEN);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new ApiError('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
        }

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
            },
            accessToken,
            refreshToken,
        };
    }

    async validateToken(token: string): Promise<User> {
        try {
            const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
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

            return user;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token inválido', HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    async register(data: RegisterData): Promise<LoginResult> {
        console.log('📝 [AuthService] register - Iniciando registro...');
        console.log('📊 [AuthService] Datos de registro:', {
            email: data.email,
            name: data.name,
        });

        if (!data.email || !data.password || !data.name) {
            console.log('❌ [AuthService] Datos de registro incompletos');
            throw new ApiError('Todos los campos son requeridos', HttpStatus.BAD_REQUEST);
        }

        const existingUser = await this.userRepository.findOne({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ApiError('El email ya está registrado', HttpStatus.CONFLICT);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = this.userRepository.create({
            email: data.email,
            password: hashedPassword,
            name: data.name,
            roles: ['user'],
        });

        await this.userRepository.save(user);

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshToken(refreshToken: string): Promise<LoginResult> {
        try {
            const decoded = jwt.verify(refreshToken, config.jwtSecret) as { id: string };
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

            const accessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles,
                },
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token inválido', HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    async logout(refreshToken: string): Promise<boolean> {
        try {
            jwt.verify(refreshToken, config.jwtSecret);
            // Aquí podrías implementar la lógica para invalidar el token
            // Por ejemplo, agregándolo a una lista negra
            return true;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Token inválido', HttpStatus.UNAUTHORIZED);
            }
            throw error;
        }
    }

    private generateAccessToken(user: User): string {
        return jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '15m' });
    }

    private generateRefreshToken(user: User): string {
        return jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '7d' });
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            // No revelar si el usuario existe o no
            return;
        }
        // Generar token seguro
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
        // Guardar token
        const prt = this.prtRepository.create({
            token,
            user,
            expiresAt,
            used: false,
        });
        await this.prtRepository.save(prt);
        // Simular envío de email
        console.log(`[AuthService] Enviar email a ${email} con token: ${token}`);
        // Aquí deberías integrar un servicio real de email
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const prt = await this.prtRepository.findOne({
            where: { token },
            relations: ['user'],
        });
        if (!prt || prt.used || prt.expiresAt < new Date()) {
            throw new ApiError('Token inválido o expirado', HttpStatus.BAD_REQUEST);
        }
        // Actualizar contraseña del usuario
        const hashed = await bcrypt.hash(newPassword, 10);
        prt.user.password = hashed;
        await this.userRepository.save(prt.user);
        // Marcar token como usado
        prt.used = true;
        await this.prtRepository.save(prt);
    }
}
