import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { ApiError } from '../core/errors/api.error';
import { HttpStatus } from '../core/constants';
import { ForgotPasswordDto, ResetPasswordDto } from '../api/dto/auth.dto';
import { sendEmail } from '../utils/email.utils';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class PasswordResetService {
    private userRepository = AppDataSource.getRepository(User);

    async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { email: forgotPasswordDto.email },
        });

        if (!user) {
            // Por seguridad, no revelamos si el email existe o no
            return;
        }

        // Generar token único
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

        // Guardar token en la base de datos
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await this.userRepository.save(user);

        // Enviar email con el link de reset
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: 'Recuperación de contraseña',
            html: `
                <h1>Recuperación de contraseña</h1>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <a href="${resetUrl}">Restablecer contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            `,
        });
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { resetToken: resetPasswordDto.token },
        });

        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw new ApiError('Token inválido o expirado', HttpStatus.BAD_REQUEST);
        }

        // Verificar que las contraseñas coincidan
        if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
            throw new ApiError('Las contraseñas no coinciden', HttpStatus.BAD_REQUEST);
        }

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

        // Actualizar contraseña y limpiar tokens
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await this.userRepository.save(user);

        // Enviar email de confirmación
        await sendEmail({
            to: user.email,
            subject: 'Contraseña actualizada',
            html: `
                <h1>Contraseña actualizada</h1>
                <p>Tu contraseña ha sido actualizada exitosamente.</p>
                <p>Si no realizaste este cambio, por favor contacta con soporte inmediatamente.</p>
            `,
        });
    }
}
