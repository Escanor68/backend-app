import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/user.dto';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class PasswordResetService {
    private userRepository = AppDataSource.getRepository(User);

    async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });

        if (!user) {
            throw new ApiError(HttpStatus.NOT_FOUND, 'Usuario no encontrado');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;

        await this.userRepository.save(user);

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: 'Recuperación de contraseña',
            text: `Para restablecer tu contraseña, visita: ${resetUrl}`,
            html: `
                <h1>Recuperación de contraseña</h1>
                <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                <a href="${resetUrl}">Restablecer contraseña</a>
                <p>Este enlace expira en 1 hora.</p>
            `,
        });
    }

    async resetPassword(dto: ResetPasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { resetToken: dto.token },
        });

        if (!user) {
            throw new ApiError(HttpStatus.BAD_REQUEST, 'Token inválido');
        }

        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, 'Token expirado');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await this.userRepository.save(user);

        await sendEmail({
            to: user.email,
            subject: 'Contraseña restablecida',
            text: 'Tu contraseña ha sido restablecida exitosamente.',
            html: `
                <h1>Contraseña restablecida</h1>
                <p>Tu contraseña ha sido restablecida exitosamente.</p>
                <p>Si no fuiste tú quien realizó este cambio, contacta inmediatamente con soporte.</p>
            `,
        });
    }
}
