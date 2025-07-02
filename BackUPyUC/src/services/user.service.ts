import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { FavoriteField } from '../models/favorite-field.model';
import { Notification } from '../models/notification.model';
import { PasswordResetToken } from '../models/password-reset-token.model';
import { CreateUserDto, ChangePasswordDto } from '../dto/user.dto';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { sendEmail } from '../utils/email';
import { UserRole } from '../types/user.types';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);
    private favoriteFieldRepository = AppDataSource.getRepository(FavoriteField);
    private notificationRepository = AppDataSource.getRepository(Notification);
    private passwordResetTokenRepository = AppDataSource.getRepository(PasswordResetToken);

    async createUser(userData: CreateUserDto): Promise<User> {
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
            roles: [UserRole.USER],
        });

        return this.userRepository.save(user);
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Usuario no encontrado');
        }

        return user;
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return null;
        }
        Object.assign(user, userData);
        return this.userRepository.save(user);
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.getUserById(id);
        await this.userRepository.remove(user);
    }

    async blockUser(id: string): Promise<User> {
        const user = await this.getUserById(id);
        user.isBlocked = true;
        return this.userRepository.save(user);
    }

    async unblockUser(id: string): Promise<User> {
        const user = await this.getUserById(id);
        user.isBlocked = false;
        return this.userRepository.save(user);
    }

    async changePassword(id: string, data: ChangePasswordDto): Promise<void> {
        const user = await this.getUserById(id);
        if (!(await user.comparePassword(data.currentPassword))) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, 'Contraseña actual incorrecta');
        }
        user.password = data.newPassword;
        await this.userRepository.save(user);
    }

    async updateRoles(id: string, roles: string[]): Promise<User> {
        const user = await this.getUserById(id);
        user.roles = roles as UserRole[];
        return this.userRepository.save(user);
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { email },
        });

        if (!user) {
            // Por seguridad, no revelamos si el email existe o no
            return;
        }

        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

        // Guardar token en la base de datos
        const resetToken = this.passwordResetTokenRepository.create({
            user: { id: user.id },
            token,
            expiresAt,
        });
        await this.passwordResetTokenRepository.save(resetToken);

        // Enviar email con el link de recuperación
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: 'Recuperación de contraseña',
            text: `Para recuperar tu contraseña, haz clic en el siguiente enlace: ${resetUrl}`,
            html: `
                <h1>Recuperación de contraseña</h1>
                <p>Para recuperar tu contraseña, haz clic en el siguiente enlace:</p>
                <a href="${resetUrl}">Recuperar contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
            `,
        });
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const resetToken = await this.passwordResetTokenRepository.findOne({
            where: { token },
            relations: ['user'],
        });

        if (!resetToken) {
            throw new ApiError(HttpStatus.BAD_REQUEST, 'Token de recuperación inválido');
        }

        if (resetToken.expiresAt < new Date()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, 'Token de recuperación expirado');
        }

        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        resetToken.user.password = hashedPassword;
        await this.userRepository.save(resetToken.user);

        // Eliminar token usado
        await this.passwordResetTokenRepository.remove(resetToken);
    }

    async getFavoriteFields(userId: string): Promise<FavoriteField[]> {
        const user = await this.getUserById(userId);
        return this.favoriteFieldRepository.find({
            where: { userId: user.id },
            relations: ['field'],
        });
    }

    async addFavoriteField(userId: string, fieldId: number): Promise<FavoriteField> {
        const user = await this.getUserById(userId);

        const existingFavorite = await this.favoriteFieldRepository.findOne({
            where: { userId: user.id, fieldId },
        });

        if (existingFavorite) {
            throw new ApiError(HttpStatus.CONFLICT, 'El campo ya está en favoritos');
        }

        const favoriteField = this.favoriteFieldRepository.create({
            userId: user.id,
            fieldId,
        });

        return this.favoriteFieldRepository.save(favoriteField);
    }

    async removeFavoriteField(userId: string, fieldId: number): Promise<void> {
        const user = await this.getUserById(userId);

        const favoriteField = await this.favoriteFieldRepository.findOne({
            where: { userId: user.id, fieldId },
        });

        if (!favoriteField) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'El campo no está en favoritos');
        }

        await this.favoriteFieldRepository.remove(favoriteField);
    }

    async getNotifications(userId: string): Promise<Notification[]> {
        const user = await this.getUserById(userId);
        return this.notificationRepository.find({
            where: { userId: user.id },
            order: { createdAt: 'DESC' },
        });
    }

    async markNotificationAsRead(userId: string, notificationId: number): Promise<void> {
        const user = await this.getUserById(userId);

        const notification = await this.notificationRepository.findOne({
            where: { userId: user.id, id: notificationId },
        });

        if (!notification) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Notificación no encontrada');
        }

        notification.isRead = true;
        await this.notificationRepository.save(notification);
    }
}
