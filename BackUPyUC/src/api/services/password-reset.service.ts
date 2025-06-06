import { AppDataSource } from '../../config/database';
import { User } from '../../models/user.model';
import { PasswordResetToken } from '../../models/password-reset-token.model';
import { RequestPasswordResetDto, ResetPasswordDto } from '../../dto/user.dto';
import { ApiError } from '../../core/errors/api.error';
import { HttpStatus } from '../../core/constants';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../../utils/email.utils';

export class PasswordResetService {
    private userRepository = AppDataSource.getRepository(User);
    private prtRepository = AppDataSource.getRepository(PasswordResetToken);

    constructor() {
        console.log('🏗️ [PasswordResetService] Inicializando PasswordResetService...');
        console.log('✅ [PasswordResetService] PasswordResetService inicializado correctamente');
    }

    async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            // Por seguridad, no revelamos si el email existe o no
            return;
        }

        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

        // Guardar token
        const passwordResetToken = this.prtRepository.create({
            token,
            user,
            expiresAt,
            used: false,
        });

        await this.prtRepository.save(passwordResetToken);

        // Enviar email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: 'Recuperación de contraseña',
            html: `
                <h1>Recuperación de contraseña</h1>
                <p>Hola ${user.name},</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <a href="${resetLink}">Restablecer contraseña</a>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            `,
        });
    }

    async resetPassword(dto: ResetPasswordDto): Promise<void> {
        const token = await this.prtRepository.findOne({
            where: { token: dto.token },
            relations: ['user'],
        });

        if (!token) {
            throw new ApiError('Token inválido', HttpStatus.BAD_REQUEST);
        }

        if (token.used) {
            throw new ApiError('Token ya utilizado', HttpStatus.BAD_REQUEST);
        }

        if (token.expiresAt < new Date()) {
            throw new ApiError('Token expirado', HttpStatus.BAD_REQUEST);
        }

        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.update(token.user.id, {
            password: hashedPassword,
        });

        // Marcar token como usado
        token.used = true;
        await this.prtRepository.save(token);
    }
}
