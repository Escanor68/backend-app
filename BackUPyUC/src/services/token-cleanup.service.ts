import { TokenBlacklistService } from './token-blacklist.service';

export class TokenCleanupService {
    private tokenBlacklistService = new TokenBlacklistService();
    private cleanupInterval: NodeJS.Timeout | null = null;

    startCleanup(intervalMinutes: number = 60): void {
        // Limpiar tokens expirados cada hora por defecto
        this.cleanupInterval = setInterval(async () => {
            try {
                console.log('🧹 [TokenCleanupService] Iniciando limpieza de tokens expirados...');
                await this.tokenBlacklistService.cleanupExpiredTokens();
                console.log('✅ [TokenCleanupService] Limpieza completada');
            } catch (error) {
                console.error('❌ [TokenCleanupService] Error en limpieza:', error);
            }
        }, intervalMinutes * 60 * 1000);

        console.log(
            `🧹 [TokenCleanupService] Servicio de limpieza iniciado (cada ${intervalMinutes} minutos)`
        );
    }

    stopCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('🛑 [TokenCleanupService] Servicio de limpieza detenido');
        }
    }

    async manualCleanup(): Promise<void> {
        try {
            console.log('🧹 [TokenCleanupService] Limpieza manual iniciada...');
            await this.tokenBlacklistService.cleanupExpiredTokens();
            console.log('✅ [TokenCleanupService] Limpieza manual completada');
        } catch (error) {
            console.error('❌ [TokenCleanupService] Error en limpieza manual:', error);
            throw error;
        }
    }
}
