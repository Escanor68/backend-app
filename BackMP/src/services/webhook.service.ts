import crypto from 'crypto';
import { Payment as MPPayment } from 'mercadopago';
import { AppDataSource } from '../config/database';
import { Payment } from '../models/payment.model';
import { config } from '../config';
import { paymentEvents } from '../events/paymentEvents';
import { logger } from '../utils/logger';

export interface WebhookEvent {
    action: string;
    api_version: string;
    data: {
        id: string;
    };
    date_created: string;
    id: number;
    live_mode: boolean;
    type: string;
    user_id: string;
}

export class WebhookService {
    private paymentRepository = AppDataSource.getRepository(Payment);
    private mercadoPagoSecret: string;

    constructor() {
        this.mercadoPagoSecret = process.env.MP_WEBHOOK_SECRET || '';
        if (!this.mercadoPagoSecret) {
            console.warn(
                '⚠️ [WebhookService] MP_WEBHOOK_SECRET no configurado - webhooks no serán seguros',
            );
        }
    }

    /**
     * Valida la firma del webhook de Mercado Pago
     */
    validateSignature(
        body: any,
        signature: string,
        timestamp: string,
    ): boolean {
        try {
            if (!this.mercadoPagoSecret) {
                console.warn(
                    '⚠️ [WebhookService] No se puede validar firma - secreto no configurado',
                );
                return false;
            }

            // Extraer componentes de la firma
            const signatureParts = signature.split(',');
            const tsParam = signatureParts.find((part) =>
                part.startsWith('ts='),
            );
            const v1Param = signatureParts.find((part) =>
                part.startsWith('v1='),
            );

            if (!tsParam || !v1Param) {
                console.error('❌ [WebhookService] Formato de firma inválido');
                return false;
            }

            const ts = tsParam.split('=')[1];
            const v1 = v1Param.split('=')[1];

            // Verificar timestamp (no mayor a 5 minutos)
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const webhookTimestamp = parseInt(ts);

            if (Math.abs(currentTimestamp - webhookTimestamp) > 300) {
                console.error(
                    '❌ [WebhookService] Webhook expirado - timestamp muy antiguo',
                );
                return false;
            }

            // Crear firma esperada
            const payload = `id=${body.data?.id}&topic=${body.type}&timestamp=${ts}`;
            const expectedSignature = crypto
                .createHmac('sha256', this.mercadoPagoSecret)
                .update(payload)
                .digest('hex');

            const isValid = crypto.timingSafeEqual(
                Buffer.from(v1, 'hex'),
                Buffer.from(expectedSignature, 'hex'),
            );

            if (!isValid) {
                console.error('❌ [WebhookService] Firma inválida');
                return false;
            }

            console.log('✅ [WebhookService] Firma válida');
            return true;
        } catch (error) {
            console.error('❌ [WebhookService] Error validando firma:', error);
            return false;
        }
    }

    /**
     * Procesa un evento de webhook de Mercado Pago
     */
    async processWebhookEvent(event: WebhookEvent): Promise<void> {
        try {
            console.log(
                `📨 [WebhookService] Procesando evento: ${event.type} - ${event.action}`,
            );
            console.log(`🆔 [WebhookService] Payment ID: ${event.data.id}`);

            switch (event.type) {
                case 'payment':
                    await this.handlePaymentEvent(event);
                    break;
                case 'merchant_order':
                    await this.handleMerchantOrderEvent(event);
                    break;
                default:
                    console.log(
                        `⚠️ [WebhookService] Tipo de evento no manejado: ${event.type}`,
                    );
            }
        } catch (error) {
            console.error(
                '❌ [WebhookService] Error procesando evento:',
                error,
            );
            logger.error('Webhook processing error:', error);
            throw error;
        }
    }

    /**
     * Maneja eventos de pago
     */
    private async handlePaymentEvent(event: WebhookEvent): Promise<void> {
        const paymentId = event.data.id;

        try {
            // Validar que tenemos el access token
            if (!config.mercadoPago.accessToken) {
                throw new Error('Access token de Mercado Pago no configurado');
            }

            // Obtener información actualizada del pago desde MP
            const mpPayment = new MPPayment({
                accessToken: config.mercadoPago.accessToken,
            });

            const paymentInfo = await mpPayment.get({ id: paymentId });
            console.log(`💳 [WebhookService] Información de pago obtenida:`, {
                id: paymentInfo.id,
                status: paymentInfo.status,
                status_detail: paymentInfo.status_detail,
            });

            // Buscar el pago en nuestra base de datos
            const payment = await this.paymentRepository.findOne({
                where: { mercadoPagoId: paymentId },
            });

            if (!payment) {
                console.warn(
                    `⚠️ [WebhookService] Pago no encontrado en BD: ${paymentId}`,
                );
                return;
            }

            const oldStatus = payment.status;
            const newStatus = paymentInfo.status;

            // Actualizar estado del pago
            payment.status = newStatus || 'unknown';
            payment.metadata = {
                ...payment.metadata,
                lastWebhookUpdate: new Date(),
                statusDetail: paymentInfo.status_detail,
                paymentInfo,
            };

            await this.paymentRepository.save(payment);

            // Emitir eventos según el cambio de estado
            if (oldStatus !== newStatus) {
                console.log(
                    `📊 [WebhookService] Estado cambió: ${oldStatus} -> ${newStatus}`,
                );

                paymentEvents.emitPaymentStatusUpdate(
                    payment.id,
                    newStatus || 'unknown',
                    {
                        previousStatus: oldStatus,
                        statusDetail: paymentInfo.status_detail,
                        webhookTriggered: true,
                    },
                );

                // Eventos específicos según el estado
                switch (newStatus) {
                    case 'approved':
                        paymentEvents.emitPaymentCompleted(
                            payment.id,
                            paymentInfo,
                        );
                        await this.handlePaymentApproved(payment);
                        break;
                    case 'rejected':
                    case 'cancelled':
                        paymentEvents.emitPaymentFailed(
                            payment.id,
                            paymentInfo.status_detail || 'Payment failed',
                        );
                        await this.handlePaymentFailed(payment);
                        break;
                    case 'refunded':
                        paymentEvents.emitRefundUpdate(payment.id, 'completed');
                        break;
                }
            }
        } catch (error) {
            console.error(
                `❌ [WebhookService] Error manejando evento de pago ${paymentId}:`,
                error,
            );
            throw error;
        }
    }

    /**
     * Maneja eventos de merchant order
     */
    private async handleMerchantOrderEvent(event: WebhookEvent): Promise<void> {
        console.log(
            `🏪 [WebhookService] Procesando merchant order: ${event.data.id}`,
        );
        // Aquí se puede implementar lógica para órdenes de comercio si es necesario
    }

    /**
     * Maneja pago aprobado - confirma reserva
     */
    private async handlePaymentApproved(payment: Payment): Promise<void> {
        try {
            console.log(
                `✅ [WebhookService] Pago aprobado - confirmando reserva: ${payment.bookingId}`,
            );

            // Aquí se integraría con el servicio de reservas
            // await this.reservationService.confirmReservation(payment.bookingId);

            // Por ahora, solo marcamos como procesado
            payment.metadata = {
                ...payment.metadata,
                reservationConfirmed: true,
                confirmedAt: new Date(),
            };

            await this.paymentRepository.save(payment);
        } catch (error) {
            console.error(
                '❌ [WebhookService] Error confirmando reserva:',
                error,
            );
            // No re-lanzar el error para no fallar el webhook
        }
    }

    /**
     * Maneja pago fallido - libera reserva
     */
    private async handlePaymentFailed(payment: Payment): Promise<void> {
        try {
            console.log(
                `❌ [WebhookService] Pago fallido - liberando reserva: ${payment.bookingId}`,
            );

            // Aquí se integraría con el servicio de reservas
            // await this.reservationService.releaseReservation(payment.bookingId);

            payment.metadata = {
                ...payment.metadata,
                reservationReleased: true,
                releasedAt: new Date(),
            };

            await this.paymentRepository.save(payment);
        } catch (error) {
            console.error(
                '❌ [WebhookService] Error liberando reserva:',
                error,
            );
        }
    }
}
