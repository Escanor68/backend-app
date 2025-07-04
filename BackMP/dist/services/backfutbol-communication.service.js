"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackFutbolCommunicationService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class BackFutbolCommunicationService {
    constructor() {
        this.backFutbolBaseUrl =
            process.env.BACKFUTBOL_BASE_URL || 'http://localhost:3001';
        this.backFutbolSecret = process.env.BACKFUTBOL_SECRET || '';
        this.axiosInstance = axios_1.default.create({
            baseURL: this.backFutbolBaseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.backFutbolSecret}`,
            },
        });
        // Interceptor para logging
        this.axiosInstance.interceptors.request.use((config) => {
            logger_1.logger.info(`🌐 [BackFutbol] Enviando request a: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.logger.error('❌ [BackFutbol] Error en request:', error);
            return Promise.reject(error);
        });
        this.axiosInstance.interceptors.response.use((response) => {
            logger_1.logger.info(`✅ [BackFutbol] Response exitosa: ${response.status} ${response.statusText}`);
            return response;
        }, (error) => {
            logger_1.logger.error('❌ [BackFutbol] Error en response:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
            });
            return Promise.reject(error);
        });
    }
    /**
     * Notifica al backend de BackFutbol sobre un pago exitoso para generar la reserva
     */
    async notifySuccessfulPayment(payment) {
        try {
            if (!payment.booking || !payment.user) {
                logger_1.logger.warn('❌ [BackFutbol] Pago sin booking o usuario, no se puede notificar');
                return;
            }
            const bookingRequest = {
                paymentId: payment.id,
                bookingId: payment.booking.id,
                fieldId: payment.field.id,
                userId: payment.user.id,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                mercadoPagoId: payment.mercadoPagoId || '',
                preferenceId: payment.preferenceId || '',
                field: payment.field,
                user: {
                    id: payment.user.id,
                    email: payment.user.email,
                    name: payment.user.name,
                },
                metadata: payment.metadata,
            };
            logger_1.logger.info('🚀 [BackFutbol] Notificando pago exitoso para generar reserva:', {
                paymentId: payment.id,
                bookingId: payment.booking.id,
                fieldId: payment.field.id,
            });
            const response = await this.axiosInstance.post('/api/payments/successful', bookingRequest);
            logger_1.logger.info('✅ [BackFutbol] Reserva generada exitosamente:', {
                paymentId: payment.id,
                bookingId: payment.booking.id,
                response: response.data,
            });
            // Notificar a otros usuarios que la cancha ya no está disponible
            await this.notifyFieldBooked(payment);
        }
        catch (error) {
            logger_1.logger.error('❌ [BackFutbol] Error notificando pago exitoso:', error);
            throw error;
        }
    }
    /**
     * Notifica a otros usuarios que la cancha ya no está disponible
     */
    async notifyFieldBooked(payment) {
        try {
            const notificationRequest = {
                fieldId: payment.field.id,
                bookingId: payment.booking.id,
                message: `La cancha "${payment.field.name}" ya no está disponible para el horario seleccionado.`,
                type: 'FIELD_BOOKED',
                data: {
                    fieldId: payment.field.id,
                    fieldName: payment.field.name,
                    bookingId: payment.booking.id,
                    bookedBy: payment.user.email,
                    amount: payment.amount,
                },
            };
            logger_1.logger.info('🔔 [BackFutbol] Notificando que cancha fue reservada:', {
                fieldId: payment.field.id,
                fieldName: payment.field.name,
            });
            const response = await this.axiosInstance.post('/api/notifications/field-booked', notificationRequest);
            logger_1.logger.info('✅ [BackFutbol] Notificación de cancha reservada enviada:', {
                fieldId: payment.field.id,
                response: response.data,
            });
        }
        catch (error) {
            logger_1.logger.error('❌ [BackFutbol] Error notificando cancha reservada:', error);
            // No lanzamos el error para no afectar el flujo principal
        }
    }
    /**
     * Notifica cuando una cancha vuelve a estar disponible (en caso de cancelación)
     */
    async notifyFieldAvailable(payment) {
        try {
            const notificationRequest = {
                fieldId: payment.field.id,
                bookingId: payment.booking.id,
                message: `La cancha "${payment.field.name}" está disponible nuevamente.`,
                type: 'FIELD_AVAILABLE',
                data: {
                    fieldId: payment.field.id,
                    fieldName: payment.field.name,
                    bookingId: payment.booking.id,
                },
            };
            logger_1.logger.info('🔔 [BackFutbol] Notificando que cancha está disponible:', {
                fieldId: payment.field.id,
                fieldName: payment.field.name,
            });
            const response = await this.axiosInstance.post('/api/notifications/field-available', notificationRequest);
            logger_1.logger.info('✅ [BackFutbol] Notificación de cancha disponible enviada:', {
                fieldId: payment.field.id,
                response: response.data,
            });
        }
        catch (error) {
            logger_1.logger.error('❌ [BackFutbol] Error notificando cancha disponible:', error);
            // No lanzamos el error para no afectar el flujo principal
        }
    }
    /**
     * Verifica la conectividad con el backend de BackFutbol
     */
    async checkConnectivity() {
        try {
            const response = await this.axiosInstance.get('/health');
            logger_1.logger.info('✅ [BackFutbol] Conectividad verificada:', response.data);
            return true;
        }
        catch (error) {
            logger_1.logger.error('❌ [BackFutbol] Error de conectividad:', error);
            return false;
        }
    }
}
exports.BackFutbolCommunicationService = BackFutbolCommunicationService;
//# sourceMappingURL=backfutbol-communication.service.js.map