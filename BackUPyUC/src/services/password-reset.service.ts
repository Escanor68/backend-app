import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { PasswordResetToken } from '../models/password-reset-token.model';
import { ApiError } from '../core/errors/api.error';
import { HttpStatus } from '../core/constants';
import { sendEmail } from '../utils/email';
import config from '../config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class PasswordResetService {
    private userRepository = AppDataSource.getRepository(User);
    private passwordResetTokenRepository = AppDataSource.getRepository(PasswordResetToken);

    async requestPasswordReset(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });

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
            token,
            user,
            expiresAt,
            used: false,
        });

        await this.passwordResetTokenRepository.save(resetToken);

        // Enviar email con el enlace de restablecimiento
        const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: 'Restablecimiento de contraseña',
            text: `Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetUrl}`,
            html: `
                <h1>Restablecimiento de contraseña</h1>
                <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                <a href="${resetUrl}">Restablecer contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
            `,
        });
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const resetToken = await this.passwordResetTokenRepository.findOne({
            where: { token, used: false },
            relations: ['user'],
        });

        if (!resetToken) {
            throw new ApiError('Token inválido o ya utilizado', HttpStatus.BAD_REQUEST);
        }

        if (resetToken.expiresAt < new Date()) {
            throw new ApiError('Token expirado', HttpStatus.BAD_REQUEST);
        }

        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(resetToken.user.id, {
            password: hashedPassword,
        });

        // Marcar token como usado
        await this.passwordResetTokenRepository.update(resetToken.id, {
            used: true,
        });
    }
}
