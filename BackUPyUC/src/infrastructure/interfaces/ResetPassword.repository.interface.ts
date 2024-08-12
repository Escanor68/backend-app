import { ResetPasswordEntity } from '../../core/entities/ResetPassword.entity';

export interface ResetPasswordRepositoryInterface {
    storeResetToken(
        userId: number,
        token: string,
        expiateToken: Date,
    ): Promise<ResetPasswordEntity>;

    findResetToken(email: string): Promise<ResetPasswordEntity | null>;

    deleteResetToken(token: string): Promise<Boolean>;
}
