"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentExpirationService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../config/database");
const payment_model_1 = require("../models/payment.model");
const typeorm_1 = require("typeorm");
const paymentEvents_1 = require("../events/paymentEvents");
const logger_1 = require("../utils/logger");
class PaymentExpirationService {
    constructor(expirationTimeMinutes = 30, // 30 minutos por defecto
    cleanupSchedule = '*/5 * * * *') {
        this.expirationTimeMinutes = expirationTimeMinutes;
        this.cleanupSchedule = cleanupSchedule;
        this.paymentRepository = database_1.AppDataSource.getRepository(payment_model_1.Payment);
        this.isRunning = false;
        console.log(`⏰ [PaymentExpiration] Servicio inicializado - Expiración: ${expirationTimeMinutes} min`);
    }
    /**
     * Inicia el servicio de limpieza automática
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ [PaymentExpiration] El servicio ya está ejecutándose');
            return;
        }
        console.log(`🚀 [PaymentExpiration] Iniciando servicio con schedule: ${this.cleanupSchedule}`);
        this.cronJob = node_cron_1.default.schedule(this.cleanupSchedule, async () => {
            try {
                await this.cleanupExpiredPayments();
            }
            catch (error) {
                console.error('❌ [PaymentExpiration] Error en limpieza automática:', error);
                logger_1.logger.error('Payment expiration cleanup error:', error);
            }
        }, {
            scheduled: true,
            timezone: 'America/Argentina/Buenos_Aires',
        });
        this.isRunning = true;
        console.log('✅ [PaymentExpiration] Servicio iniciado correctamente');
    }
    /**
     * Detiene el servicio de limpieza automática
     */
    stop() {
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
    async cleanupExpiredPayments() {
        try {
            console.log('🧹 [PaymentExpiration] Iniciando limpieza de pagos expirados...');
            const cutoffTime = new Date(Date.now() - this.expirationTimeMinutes * 60 * 1000);
            console.log(`⏰ [PaymentExpiration] Fecha de corte: ${cutoffTime.toISOString()}`);
            // Buscar pagos pendientes expirados
            const expiredPayments = await this.paymentRepository.find({
                where: {
                    status: 'pending',
                    createdAt: (0, typeorm_1.LessThan)(cutoffTime),
                },
            });
            console.log(`📊 [PaymentExpiration] Se encontraron ${expiredPayments.length} pagos expirados`);
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
                }
                catch (error) {
                    console.error(`❌ [PaymentExpiration] Error expirando pago ${payment.id}:`, error);
                    errors++;
                }
            }
            const result = { expiredCount, releasedReservations, errors };
            console.log('✅ [PaymentExpiration] Limpieza completada:', result);
            logger_1.logger.info('Payment expiration cleanup completed', result);
            return result;
        }
        catch (error) {
            console.error('❌ [PaymentExpiration] Error en limpieza general:', error);
            logger_1.logger.error('Payment expiration cleanup failed:', error);
            throw error;
        }
    }
    /**
     * Expira un pago específico
     */
    async expirePayment(payment) {
        console.log(`⏰ [PaymentExpiration] Expirando pago: ${payment.id}`);
        const oldStatus = payment.status;
        payment.status = 'expired';
        // Actualizar metadata
        payment.metadata = {
            ...payment.metadata,
            expiredAt: new Date(),
            originalStatus: oldStatus,
            expiredBy: 'automatic-cleanup',
            expirationReason: `Payment expired after ${this.expirationTimeMinutes} minutes`,
        };
        await this.paymentRepository.save(payment);
        // Emitir eventos
        paymentEvents_1.paymentEvents.emitPaymentFailed(payment.id, `Payment expired after ${this.expirationTimeMinutes} minutes`);
        paymentEvents_1.paymentEvents.emitPaymentStatusUpdate(payment.id, 'expired', {
            previousStatus: oldStatus,
            expiredAt: new Date(),
            automaticExpiration: true,
        });
        console.log(`✅ [PaymentExpiration] Pago ${payment.id} expirado correctamente`);
    }
    /**
     * Libera una reserva asociada a un pago expirado
     */
    async releaseReservation(bookingId) {
        try {
            console.log(`🔓 [PaymentExpiration] Liberando reserva: ${bookingId}`);
            // Aquí se integraría con el servicio de reservas (BackUPyUC)
            // Por ahora, solo registramos la acción
            // await this.reservationService.releaseReservation(bookingId, {
            //     reason: 'payment_expired',
            //     timestamp: new Date()
            // });
            console.log(`✅ [PaymentExpiration] Reserva ${bookingId} marcada para liberación`);
        }
        catch (error) {
            console.error(`❌ [PaymentExpiration] Error liberando reserva ${bookingId}:`, error);
            throw error;
        }
    }
    /**
     * Verifica si un pago específico ha expirado
     */
    async checkPaymentExpiration(paymentId) {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });
            if (!payment) {
                throw new Error(`Pago no encontrado: ${paymentId}`);
            }
            // Si ya está expirado en BD
            if (payment.status === 'expired') {
                return {
                    isExpired: true,
                    expiredAt: payment.metadata?.expiredAt || payment.updatedAt,
                };
            }
            // Si no está pendiente, no puede expirar
            if (payment.status !== 'pending') {
                return { isExpired: false };
            }
            // Calcular tiempo restante
            const now = new Date();
            const paymentTime = new Date(payment.createdAt);
            const expirationTime = new Date(paymentTime.getTime() + this.expirationTimeMinutes * 60 * 1000);
            const minutesRemaining = Math.ceil((expirationTime.getTime() - now.getTime()) / (1000 * 60));
            const isExpired = minutesRemaining <= 0;
            if (isExpired && payment.status === 'pending') {
                // Expirar automáticamente si está vencido
                await this.expirePayment(payment);
                return { isExpired: true, expiredAt: new Date() };
            }
            return {
                isExpired: false,
                minutesRemaining: Math.max(0, minutesRemaining),
            };
        }
        catch (error) {
            console.error(`❌ [PaymentExpiration] Error verificando expiración de ${paymentId}:`, error);
            throw error;
        }
    }
    /**
     * Extiende el tiempo de expiración de un pago (si es permitido)
     */
    async extendPaymentExpiration(paymentId, additionalMinutes, reason = 'Manual extension') {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });
            if (!payment) {
                throw new Error(`Pago no encontrado: ${paymentId}`);
            }
            if (payment.status !== 'pending') {
                throw new Error(`No se puede extender un pago con estado: ${payment.status}`);
            }
            // Actualizar metadata con extensión
            payment.metadata = {
                ...payment.metadata,
                extensions: [
                    ...(payment.metadata?.extensions || []),
                    {
                        extendedAt: new Date(),
                        additionalMinutes,
                        reason,
                        newExpirationTime: new Date(Date.now() + additionalMinutes * 60 * 1000),
                    },
                ],
            };
            await this.paymentRepository.save(payment);
            console.log(`⏰ [PaymentExpiration] Pago ${paymentId} extendido por ${additionalMinutes} minutos`);
            return true;
        }
        catch (error) {
            console.error(`❌ [PaymentExpiration] Error extendiendo pago ${paymentId}:`, error);
            throw error;
        }
    }
    /**
     * Obtiene estadísticas de pagos expirados
     */
    async getExpirationStats(days = 7) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const expiredPayments = await this.paymentRepository.find({
            where: {
                status: 'expired',
                updatedAt: (0, typeorm_1.LessThan)(new Date()),
            },
        });
        const totalExpired = expiredPayments.length;
        const expiredToday = expiredPayments.filter((p) => p.updatedAt >= todayStart).length;
        const expiredThisWeek = expiredPayments.filter((p) => p.updatedAt >= startDate).length;
        // Calcular tiempo promedio hasta expiración
        const times = expiredPayments
            .filter((p) => p.metadata?.expiredAt)
            .map((p) => {
            const created = new Date(p.createdAt).getTime();
            const expired = new Date(p.metadata.expiredAt).getTime();
            return (expired - created) / (1000 * 60); // en minutos
        });
        const averageTimeToExpiration = times.length > 0
            ? times.reduce((sum, time) => sum + time, 0) / times.length
            : 0;
        return {
            totalExpired,
            expiredToday,
            expiredThisWeek,
            averageTimeToExpiration: Math.round(averageTimeToExpiration),
        };
    }
    /**
     * Obtiene el estado del servicio
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            schedule: this.cleanupSchedule,
            expirationTime: this.expirationTimeMinutes,
            nextRun: this.cronJob?.getNextExecution(),
        };
    }
}
exports.PaymentExpirationService = PaymentExpirationService;
//# sourceMappingURL=payment-expiration.service.js.map