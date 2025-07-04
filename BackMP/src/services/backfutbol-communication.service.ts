import axios, { AxiosInstance } from 'axios';
import { Payment } from '../models/payment.model';
import { logger } from '../utils/logger';

export interface BackFutbolBookingRequest {
    paymentId: string;
    bookingId: string;
    fieldId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    mercadoPagoId: string;
    preferenceId: string;
    field: {
        id: string;
        name: string;
        ownerId: string;
        ownerName: string;
        ownerEmail: string;
        location: string;
        price: number;
    };
    user: {
        id: string;
        email: string;
        name?: string;
    };
    metadata?: any;
}

export interface BackFutbolNotificationRequest {
    fieldId: string;
    bookingId: string;
    message: string;
    type: 'FIELD_BOOKED' | 'FIELD_AVAILABLE';
    data?: any;
}

export class BackFutbolCommunicationService {
    private axiosInstance: AxiosInstance;
    private backFutbolBaseUrl: string;
    private backFutbolSecret: string;

    constructor() {
        this.backFutbolBaseUrl =
            process.env.BACKFUTBOL_BASE_URL || 'http://localhost:3001';
        this.backFutbolSecret = process.env.BACKFUTBOL_SECRET || '';

        this.axiosInstance = axios.create({
            baseURL: this.backFutbolBaseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.backFutbolSecret}`,
            },
        });

        // Interceptor para logging
        this.axiosInstance.interceptors.request.use(
            (config: any) => {
                logger.info(
                    `🌐 [BackFutbol] Enviando request a: ${config.method?.toUpperCase()} ${config.url}`,
                );
                return config;
            },
            (error: any) => {
                logger.error('❌ [BackFutbol] Error en request:', error);
                return Promise.reject(error);
            },
        );

        this.axiosInstance.interceptors.response.use(
            (response: any) => {
                logger.info(
                    `✅ [BackFutbol] Response exitosa: ${response.status} ${response.statusText}`,
                );
                return response;
            },
            (error: any) => {
                logger.error('❌ [BackFutbol] Error en response:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: error.config?.url,
                });
                return Promise.reject(error);
            },
        );
    }

    /**
     * Notifica al backend de BackFutbol sobre un pago exitoso para generar la reserva
     */
    async notifySuccessfulPayment(payment: Payment): Promise<void> {
        try {
            if (!payment.booking || !payment.user) {
                logger.warn(
                    '❌ [BackFutbol] Pago sin booking o usuario, no se puede notificar',
                );
                return;
            }

            const bookingRequest: BackFutbolBookingRequest = {
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

            logger.info(
                '🚀 [BackFutbol] Notificando pago exitoso para generar reserva:',
                {
                    paymentId: payment.id,
                    bookingId: payment.booking.id,
                    fieldId: payment.field.id,
                },
            );

            const response = await this.axiosInstance.post(
                '/api/payments/successful',
                bookingRequest,
            );

            logger.info('✅ [BackFutbol] Reserva generada exitosamente:', {
                paymentId: payment.id,
                bookingId: payment.booking.id,
                response: response.data,
            });

            // Notificar a otros usuarios que la cancha ya no está disponible
            await this.notifyFieldBooked(payment);
        } catch (error) {
            logger.error(
                '❌ [BackFutbol] Error notificando pago exitoso:',
                error,
            );
            throw error;
        }
    }

    /**
     * Notifica a otros usuarios que la cancha ya no está disponible
     */
    async notifyFieldBooked(payment: Payment): Promise<void> {
        try {
            const notificationRequest: BackFutbolNotificationRequest = {
                fieldId: payment.field.id,
                bookingId: payment.booking!.id,
                message: `La cancha "${payment.field.name}" ya no está disponible para el horario seleccionado.`,
                type: 'FIELD_BOOKED',
                data: {
                    fieldId: payment.field.id,
                    fieldName: payment.field.name,
                    bookingId: payment.booking!.id,
                    bookedBy: payment.user!.email,
                    amount: payment.amount,
                },
            };

            logger.info(
                '🔔 [BackFutbol] Notificando que cancha fue reservada:',
                {
                    fieldId: payment.field.id,
                    fieldName: payment.field.name,
                },
            );

            const response = await this.axiosInstance.post(
                '/api/notifications/field-booked',
                notificationRequest,
            );

            logger.info(
                '✅ [BackFutbol] Notificación de cancha reservada enviada:',
                {
                    fieldId: payment.field.id,
                    response: response.data,
                },
            );
        } catch (error) {
            logger.error(
                '❌ [BackFutbol] Error notificando cancha reservada:',
                error,
            );
            // No lanzamos el error para no afectar el flujo principal
        }
    }

    /**
     * Notifica cuando una cancha vuelve a estar disponible (en caso de cancelación)
     */
    async notifyFieldAvailable(payment: Payment): Promise<void> {
        try {
            const notificationRequest: BackFutbolNotificationRequest = {
                fieldId: payment.field.id,
                bookingId: payment.booking!.id,
                message: `La cancha "${payment.field.name}" está disponible nuevamente.`,
                type: 'FIELD_AVAILABLE',
                data: {
                    fieldId: payment.field.id,
                    fieldName: payment.field.name,
                    bookingId: payment.booking!.id,
                },
            };

            logger.info(
                '🔔 [BackFutbol] Notificando que cancha está disponible:',
                {
                    fieldId: payment.field.id,
                    fieldName: payment.field.name,
                },
            );

            const response = await this.axiosInstance.post(
                '/api/notifications/field-available',
                notificationRequest,
            );

            logger.info(
                '✅ [BackFutbol] Notificación de cancha disponible enviada:',
                {
                    fieldId: payment.field.id,
                    response: response.data,
                },
            );
        } catch (error) {
            logger.error(
                '❌ [BackFutbol] Error notificando cancha disponible:',
                error,
            );
            // No lanzamos el error para no afectar el flujo principal
        }
    }

    /**
     * Verifica la conectividad con el backend de BackFutbol
     */
    async checkConnectivity(): Promise<boolean> {
        try {
            const response = await this.axiosInstance.get('/health');
            logger.info(
                '✅ [BackFutbol] Conectividad verificada:',
                response.data,
            );
            return true;
        } catch (error) {
            logger.error('❌ [BackFutbol] Error de conectividad:', error);
            return false;
        }
    }
}
