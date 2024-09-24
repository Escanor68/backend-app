import { Repository } from 'typeorm';
import { initializeConnection } from '../utils/decorators';
import { Transactional } from 'typeorm-transactional';
import { ResetPasswordRepositoryInterface } from '../interfaces/ResetPassword.repository.interface';
import { ResetPasswordEntity } from '../../core/entities/ResetPassword.entity';

export class ResetPasswordRepository
    implements ResetPasswordRepositoryInterface
{
    private resetPasswordRepository: Repository<ResetPasswordEntity>;

    constructor(resetPasswordRepository: Repository<ResetPasswordEntity>) {
        this.resetPasswordRepository = resetPasswordRepository;
    }

    @initializeConnection()
    async findResetToken(token: string): Promise<ResetPasswordEntity | null> {
        try {
            const result = await this.resetPasswordRepository
                .createQueryBuilder('restorePassword')
                .where('token = :token', { token })
                .getOne();

            return result || null;
        } catch (error) {
            console.error('Error in findResetToken:', error);
            return null;
        }
    }

    @initializeConnection()
    async deleteResetToken(token: string): Promise<Boolean> {
        try {
            const result = await this.resetPasswordRepository
                .createQueryBuilder('restorePassword')
                .delete()
                .from(ResetPasswordEntity)
                .where('token = :token', { token })
                .execute();

            return result != null;
        } catch (error) {
            console.error('Error in deleteResetToken:', error);
            return false;
        }
    }

    @initializeConnection()
    @Transactional()
    async storeResetToken(
        userId: number,
        token: string,
        expiateToken: Date,
    ): Promise<ResetPasswordEntity> {
        try {
            const newToken = new ResetPasswordEntity();
            newToken.userId = userId;
            newToken.token = token;
            newToken.expiateToken = expiateToken;
            return await this.resetPasswordRepository.save(newToken);
        } catch (error) {
            throw new Error(
                `Error al almacenar el token de restablecimiento: ${error}`,
            );
        }
    }
}
