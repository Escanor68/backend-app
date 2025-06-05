import { Request, Response, NextFunction } from 'express';
import { PasswordResetService } from '../api/services/password-reset.service';
import { RequestPasswordResetDto, ResetPasswordDto } from '../dto/user.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class PasswordResetController {
    private passwordResetService: PasswordResetService;

    constructor() {
        this.passwordResetService = new PasswordResetService();
        console.log(
            '🏗️ [PasswordResetController] Inicializando PasswordResetController...',
        );
        console.log(
            '✅ [PasswordResetController] PasswordResetController inicializado correctamente',
        );
    }

    async requestPasswordReset(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            console.log(
                '🔑 [PasswordResetController] requestPasswordReset - Iniciando...',
            );

            const dto = plainToClass(RequestPasswordResetDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                console.log(
                    '❌ [PasswordResetController] Errores de validación:',
                    errors,
                );
                res.status(400).json({ errors });
                return;
            }

            await this.passwordResetService.requestPasswordReset(dto);

            console.log(
                '✅ [PasswordResetController] Solicitud de recuperación de contraseña procesada',
            );
            res.status(200).json({
                message:
                    'Si el email existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña',
            });
        } catch (error) {
            console.error('❌ [PasswordResetController] Error:', error);
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log(
                '🔑 [PasswordResetController] resetPassword - Iniciando...',
            );

            const dto = plainToClass(ResetPasswordDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                console.log(
                    '❌ [PasswordResetController] Errores de validación:',
                    errors,
                );
                res.status(400).json({ errors });
                return;
            }

            await this.passwordResetService.resetPassword(dto);

            console.log(
                '✅ [PasswordResetController] Contraseña restablecida exitosamente',
            );
            res.status(200).json({
                message: 'Contraseña restablecida exitosamente',
            });
        } catch (error) {
            console.error('❌ [PasswordResetController] Error:', error);
            next(error);
        }
    }
}
