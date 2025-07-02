import { AppDataSource } from '../config/database';
import { BlacklistedToken } from '../models/blacklisted-token.model';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    exp: number;
}

export class TokenBlacklistService {
    private blacklistedTokenRepository = AppDataSource.getRepository(BlacklistedToken);

    async addToBlacklist(token: string, userId: string, reason: string = 'logout'): Promise<void> {
        try {
            // Decodificar el token para obtener la fecha de expiración
            const decoded = jwt.decode(token) as JwtPayload;
            const expiresAt = new Date(decoded.exp * 1000);

            const blacklistedToken = this.blacklistedTokenRepository.create({
                token,
                userId,
                expiresAt,
                reason,
            });

            await this.blacklistedTokenRepository.save(blacklistedToken);
            console.log(
                `🚫 [TokenBlacklistService] Token agregado a la lista negra para usuario ${userId}`
            );
        } catch (error) {
            console.error(
                '❌ [TokenBlacklistService] Error agregando token a la lista negra:',
                error
            );
            throw error;
        }
    }

    async isBlacklisted(token: string): Promise<boolean> {
        try {
            const blacklistedToken = await this.blacklistedTokenRepository.findOne({
                where: { token },
            });

            if (blacklistedToken) {
                // Si el token ha expirado, lo eliminamos de la lista negra
                if (blacklistedToken.expiresAt < new Date()) {
                    await this.blacklistedTokenRepository.remove(blacklistedToken);
                    return false;
                }
                return true;
            }

            return false;
        } catch (error) {
            console.error(
                '❌ [TokenBlacklistService] Error verificando token en lista negra:',
                error
            );
            return false;
        }
    }

    async cleanupExpiredTokens(): Promise<void> {
        try {
            const expiredTokens = await this.blacklistedTokenRepository
                .createQueryBuilder('token')
                .where('token.expiresAt < :now', { now: new Date() })
                .getMany();

            if (expiredTokens.length > 0) {
                await this.blacklistedTokenRepository.remove(expiredTokens);
                console.log(
                    `🧹 [TokenBlacklistService] Limpiados ${expiredTokens.length} tokens expirados`
                );
            }
        } catch (error) {
            console.error('❌ [TokenBlacklistService] Error limpiando tokens expirados:', error);
        }
    }

    async getBlacklistedTokensByUser(userId: string): Promise<BlacklistedToken[]> {
        return this.blacklistedTokenRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async removeFromBlacklist(token: string): Promise<void> {
        try {
            const blacklistedToken = await this.blacklistedTokenRepository.findOne({
                where: { token },
            });

            if (blacklistedToken) {
                await this.blacklistedTokenRepository.remove(blacklistedToken);
                console.log(`✅ [TokenBlacklistService] Token removido de la lista negra`);
            }
        } catch (error) {
            console.error(
                '❌ [TokenBlacklistService] Error removiendo token de la lista negra:',
                error
            );
            throw error;
        }
    }
}
