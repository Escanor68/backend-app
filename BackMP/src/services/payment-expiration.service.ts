import * as cron from 'node-cron';
import { AppDataSource } from '../config/database';
import { Payment } from '../models/payment.model';
import { LessThan } from 'typeorm';
import { paymentEvents } from '../events/paymentEvents';
import { logger } from '../utils/logger';
import { PaymentStatus } from '../types/payment.types';
import { v4 as uuidv4 } from 'uuid';

export class PaymentExpirationService {
    private paymentRepository = AppDataSource.getRepository(Payment);
    private isRunning = false;
    private cronJob?: cron.ScheduledTask;

    constructor(
        private expirationTimeMinutes: number = 30, // 30 minutos por defecto
        private cleanupSchedule: string = '*/5 * * * *', // Cada 5 minutos
    ) {
        console.log(
            `⏰ [PaymentExpiration] Servicio inicializado - Expiración: ${expirationTimeMinutes} min`,
        );
    }

    /**
     * Inicia el servicio de limpieza automática
     */
    start(): void {
        if (this.isRunning) {
            console.log(
                '⚠️ [PaymentExpiration] El servicio ya está ejecutándose',
            );
            return;
        }

        console.log(
            `🚀 [PaymentExpiration] Iniciando servicio con schedule: ${this.cleanupSchedule}`,
        );

        this.cronJob = cron.schedule(
            this.cleanupSchedule,
            async () => {
                try {
                    await this.cleanupExpiredPayments();
                } catch (error) {
                    console.error(
                        '❌ [PaymentExpiration] Error en limpieza automática:',
                        error,
                    );
                    logger.error('Payment expiration cleanup error:', error);
                }
            },
            {
                timezone: 'America/Argentina/Buenos_Aires',
            },
        );

        this.isRunning = true;
        console.log('✅ [PaymentExpiration] Servicio iniciado correctamente');
    }

    /**
     * Detiene el servicio de limpieza automática
     */
    stop(): void {
        if (this.cronJob) {
            this.cronJob.destroy();
            this.cronJob = undefined;
        }

        this.isRunning = false;
        console.log('🛑 [PaymentExpiration] Servicio detenido');
    }

    /**
     * Limpia pagos expirados manualmente
     */
    async cleanupExpiredPayments(): Promise<{
        expiredCount: number;
        releasedReservations: number;
        errors: number;
    }> {
        try {
            console.log(
                '🧹 [PaymentExpiration] Iniciando limpieza de pagos expirados...',
            );

            const cutoffTime = new Date(
                Date.now() - this.expirationTimeMinutes * 60 * 1000,
            );
            console.log(
                `⏰ [PaymentExpiration] Fecha de corte: ${cutoffTime.toISOString()}`,
            );

            // Buscar pagos pendientes expirados
            const expiredPayments =
                (await this.paymentRepository.find({
                    where: {
                        status: PaymentStatus.PENDING,
                        createdAt: LessThan(cutoffTime),
                    },
                })) || [];

            console.log(
                `📊 [PaymentExpiration] Se encontraron ${expiredPayments.length} pagos expirados`,
            );

            let expiredCount = 0;
            let releasedReservations = 0;
            let errors = 0;

            for (const payment of expiredPayments) {
                try {
                    await this.expirePayment(payment);
                    expiredCount++;

                    // Si tiene reserva asociada, liberarla
                    if (payment.bookingId) {
                        await this.releaseReservation(payment.bookingId);
                        releasedReservations++;
                    }
                } catch (error) {
                    console.error(
                        `❌ [PaymentExpiration] Error expirando pago ${payment.id}:`,
                        error,
                    );
                    errors++;
                }
            }

            const result = { expiredCount, releasedReservations, errors };

            console.log('✅ [PaymentExpiration] Limpieza completada:', result);
            logger.info('Payment expiration cleanup completed', result);

            return result;
        } catch (error) {
            console.error(
                '❌ [PaymentExpiration] Error en limpieza general:',
                error,
            );
            logger.error('Payment expiration cleanup failed:', error);
            return {
                expiredCount: 0,
                releasedReservations: 0,
                errors: 1,
            };
        }
    }

    /**
     * Expira un pago específico
     */
    private async expirePayment(payment: Payment): Promise<void> {
        console.log(`⏰ [PaymentExpiration] Expirando pago: ${payment.id}`);

        const oldStatus = payment.status;
        payment.status = PaymentStatus.EXPIRED;

        // Actualizar metadata
        payment.metadata = {
            ...payment.metadata,
            expiredAt: new Date(),
            // originalStatus, expiredBy y expirationReason no están en el tipo, pero puedes agregarlos si los necesitas
        };

        await this.paymentRepository.save(payment);

        // Emitir eventos
        paymentEvents.emitPaymentFailed(
            payment.id,
            `Payment expired after ${this.expirationTimeMinutes} minutes`,
        );

        paymentEvents.emitPaymentStatusUpdate(
            payment.id,
            PaymentStatus.EXPIRED,
            {
                previousStatus: oldStatus,
                expiredAt: new Date(),
                automaticExpiration: true,
            },
        );

        console.log(
            `✅ [PaymentExpiration] Pago ${payment.id} expirado correctamente`,
        );
    }

    /**
     * Libera una reserva asociada a un pago expirado
     */
    private async releaseReservation(bookingId: string): Promise<void> {
        try {
            console.log(
                `🔓 [PaymentExpiration] Liberando reserva: ${bookingId}`,
            );

            // Aquí se integraría con el servicio de reservas (BackUPyUC)
            // Por ahora, solo registramos la acción

            // await this.reservationService.releaseReservation(bookingId, {
            //     reason: 'payment_expired',
            //     timestamp: new Date()
            // });

            console.log(
                `✅ [PaymentExpiration] Reserva ${bookingId} marcada para liberación`,
            );
        } catch (error) {
            console.error(
                `❌ [PaymentExpiration] Error liberando reserva ${bookingId}:`,
                error,
            );
            throw error;
        }
    }

    /**
     * Verifica si un pago específico ha expirado
     */
    async checkPaymentExpiration(paymentId: string): Promise<{
        isExpired: boolean;
        minutesRemaining?: number;
        expiredAt?: Date;
    }> {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });

            if (!payment) {
                throw new Error(`Pago no encontrado: ${paymentId}`);
            }

            // Si ya está expirado en BD
            if (payment.status === PaymentStatus.EXPIRED) {
                return {
                    isExpired: true,
                    expiredAt: payment.metadata?.expiredAt || payment.updatedAt,
                };
            }

            // Si no está pendiente, no puede expirar
            if (payment.status !== PaymentStatus.PENDING) {
                return { isExpired: false };
            }

            // Calcular tiempo restante
            const now = new Date();
            const paymentTime = new Date(payment.createdAt);
            const expirationTime = new Date(
                paymentTime.getTime() + this.expirationTimeMinutes * 60 * 1000,
            );
            const minutesRemaining = Math.ceil(
                (expirationTime.getTime() - now.getTime()) / (1000 * 60),
            );

            const isExpired = minutesRemaining <= 0;

            if (isExpired && payment.status === PaymentStatus.PENDING) {
                // Expirar automáticamente si está vencido
                await this.expirePayment(payment);
                return { isExpired: true, expiredAt: new Date() };
            }

            return {
                isExpired: false,
                minutesRemaining: Math.max(0, minutesRemaining),
            };
        } catch (error) {
            console.error(
                `❌ [PaymentExpiration] Error verificando expiración de ${paymentId}:`,
                error,
            );
            throw error;
        }
    }

    /**
     * Extiende el tiempo de expiración de un pago (si es permitido)
     */
    async extendPaymentExpiration(
        paymentId: string,
        additionalMinutes: number,
        reason: string = 'Manual extension',
    ): Promise<boolean> {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });

            if (!payment) {
                throw new Error(`Pago no encontrado: ${paymentId}`);
            }

            if (payment.status !== PaymentStatus.PENDING) {
                throw new Error(
                    `No se puede extender un pago con estado: ${payment.status}`,
                );
            }

            // Actualizar metadata con extensión
            payment.metadata = {
                ...payment.metadata,
                extensions: [
                    ...(payment.metadata?.extensions || []),
                    {
                        id: uuidv4(),
                        requestedAt: new Date(),
                        grantedAt: new Date(),
                        expiresAt: new Date(
                            Date.now() + additionalMinutes * 60 * 1000,
                        ),
                        reason,
                        grantedBy: 'manual',
                        status: 'approved',
                    },
                ],
            };

            await this.paymentRepository.save(payment);

            console.log(
                `⏰ [PaymentExpiration] Pago ${paymentId} extendido por ${additionalMinutes} minutos`,
            );

            return true;
        } catch (error) {
            console.error(
                `❌ [PaymentExpiration] Error extendiendo pago ${paymentId}:`,
                error,
            );
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de pagos expirados
     */
    async getExpirationStats(days: number = 7): Promise<{
        totalExpired: number;
        expiredToday: number;
        expiredThisWeek: number;
        averageTimeToExpiration: number;
    }> {
        try {
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const expiredPayments =
                (await this.paymentRepository.find({
                    where: {
                        status: PaymentStatus.EXPIRED,
                        updatedAt: LessThan(new Date()),
                    },
                })) || [];

            const totalExpired = expiredPayments.length;
            const expiredToday = expiredPayments.filter(
                (p) => p.updatedAt >= todayStart,
            ).length;
            const expiredThisWeek = expiredPayments.filter(
                (p) => p.updatedAt >= startDate,
            ).length;

            // Calcular tiempo promedio hasta expiración
            const expiredWithDate = expiredPayments
                .filter((p) => p.metadata?.expiredAt)
                .map((p) => {
                    if (!p.metadata?.expiredAt) return 0;
                    const expired = new Date(p.metadata.expiredAt).getTime();
                    const created = new Date(p.createdAt).getTime();
                    return expired - created;
                });

            const averageTimeToExpiration =
                expiredWithDate.length > 0
                    ? expiredWithDate.reduce((sum, time) => sum + time, 0) /
                      expiredWithDate.length
                    : 0;

            return {
                totalExpired,
                expiredToday,
                expiredThisWeek,
                averageTimeToExpiration: Math.round(averageTimeToExpiration),
            };
        } catch (error) {
            console.error(
                '❌ [PaymentExpiration] Error obteniendo estadísticas:',
                error,
            );
            return {
                totalExpired: 0,
                expiredToday: 0,
                expiredThisWeek: 0,
                averageTimeToExpiration: 0,
            };
        }
    }

    /**
     * Obtiene el estado del servicio
     */
    getStatus(): {
        isRunning: boolean;
        schedule: string;
        expirationTime: number;
        nextRun?: string;
    } {
        return {
            isRunning: this.isRunning,
            schedule: this.cleanupSchedule,
            expirationTime: this.expirationTimeMinutes,
            nextRun: this.isRunning ? 'Available when running' : undefined,
        };
    }
}
