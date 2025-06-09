import crypto from 'crypto';
import { Payment as MPPayment } from 'mercadopago';
import { AppDataSource } from '../config/database';
import { Payment } from '../models/payment.model';
import { Booking } from '../models/booking.model';
import { Field } from '../models/field.model';
import { User } from '../models/user.model';
import { config } from '../config';
import { paymentEvents } from '../events/paymentEvents';
import { logger } from '../utils/logger';
import { PaymentStatus } from '../types/payment.types';
import { BookingStatus } from '../types/booking.types';
import { NotificationService } from './notification.service';
import { MercadoPagoService } from './mercado-pago.service';
import { PaymentMetadata } from '../types/payment.types';

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
    private bookingRepository = AppDataSource.getRepository(Booking);
    private fieldRepository = AppDataSource.getRepository(Field);
    private userRepository = AppDataSource.getRepository(User);
    private notificationService: NotificationService;
    private mercadoPagoService: MercadoPagoService;
    private mercadoPagoSecret: string;

    constructor() {
        this.notificationService = new NotificationService();
        this.mercadoPagoService = new MercadoPagoService();
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
    async handleWebhook(event: WebhookEvent): Promise<void> {
        try {
            logger.info('Webhook recibido:', event);

            switch (event.type) {
                case 'payment':
                    await this.handlePaymentWebhook(event);
                    break;
                case 'refund':
                    await this.handleRefundWebhook(event);
                    break;
                case 'merchant_order':
                    await this.handleMerchantOrderEvent(event);
                    break;
                default:
                    logger.warn('Tipo de webhook no manejado:', event.type);
            }
        } catch (error) {
            logger.error('Error procesando webhook:', error);
            throw error;
        }
    }

    private async handlePaymentWebhook(event: WebhookEvent): Promise<void> {
        try {
            const paymentId = event.data.id;
            const payment = await this.paymentRepository.findOne({
                where: { externalId: paymentId },
                relations: ['booking', 'field', 'user'],
            });

            if (!payment) {
                logger.warn('Pago no encontrado:', paymentId);
                return;
            }

            const paymentInfo = await this.mercadoPagoService.getPayment(
                paymentId,
            );
            const newStatus = this.mapMercadoPagoStatus(paymentInfo.status);

            if (newStatus !== payment.status) {
                payment.status = newStatus;
                payment.metadata = {
                    ...payment.metadata,
                    transactionId: paymentInfo.id,
                    paymentMethodId: paymentInfo.payment_method_id,
                    paymentTypeId: paymentInfo.payment_type_id,
                    statusDetail: paymentInfo.status_detail,
                    externalReference: paymentInfo.external_reference,
                    description: paymentInfo.description,
                };

                await this.paymentRepository.save(payment);

                // Actualizar estado de la reserva
                if (payment.booking) {
                    await this.updateBookingStatus(payment);
                }

                // Notificar al usuario
                await this.notifyUser(payment);
            }
        } catch (error) {
            logger.error('Error procesando webhook de pago:', error);
            throw error;
        }
    }

    private async handleRefundWebhook(event: WebhookEvent): Promise<void> {
        try {
            const refundId = event.data.id;
            const refund = await this.mercadoPagoService.getRefund(refundId);
            const payment = await this.paymentRepository.findOne({
                where: { externalId: refund.payment_id },
                relations: ['booking', 'field', 'user'],
            });

            if (!payment) {
                logger.warn(
                    'Pago no encontrado para reembolso:',
                    refund.payment_id,
                );
                return;
            }

            payment.status = PaymentStatus.REFUNDED;
            payment.metadata = {
                ...payment.metadata,
                transactionId: refund.id,
                paymentMethodId: refund.payment_id,
                paymentTypeId: refund.payment_id,
                statusDetail: refund.status,
                externalReference: refund.external_reference,
                description: refund.reason,
            };

            await this.paymentRepository.save(payment);

            // Actualizar estado de la reserva
            if (payment.booking) {
                await this.updateBookingStatus(payment);
            }

            // Notificar al usuario
            await this.notifyUser(payment);
        } catch (error) {
            logger.error('Error procesando webhook de reembolso:', error);
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

    private async updateBookingStatus(payment: Payment): Promise<void> {
        try {
            if (!payment.booking) return;

            const booking = await this.bookingRepository.findOne({
                where: { id: payment.booking.id },
            });

            if (!booking) {
                logger.warn('Reserva no encontrada:', payment.booking.id);
                return;
            }

            let newStatus: BookingStatus;

            switch (payment.status) {
                case PaymentStatus.APPROVED:
                    newStatus = BookingStatus.CONFIRMED;
                    break;
                case PaymentStatus.REJECTED:
                case PaymentStatus.CANCELLED:
                case PaymentStatus.REFUNDED:
                    newStatus = BookingStatus.CANCELLED;
                    break;
                default:
                    return;
            }

            if (newStatus !== booking.status) {
                booking.status = newStatus;
                await this.bookingRepository.save(booking);

                // Notificar al usuario sobre el cambio de estado
                await this.notifyUser(payment);
            }
        } catch (error) {
            logger.error('Error actualizando estado de reserva:', error);
            throw error;
        }
    }

    private async notifyUser(payment: Payment): Promise<void> {
        try {
            if (!payment.user) return;

            const message = this.getStatusMessage(payment);
            await this.notificationService.sendNotification({
                userId: payment.user.id,
                title: 'Actualización de Pago',
                message,
                type: 'PAYMENT_UPDATE',
                data: {
                    paymentId: payment.id,
                    status: payment.status,
                },
            });
        } catch (error) {
            logger.error('Error notificando al usuario:', error);
        }
    }

    private getStatusMessage(payment: Payment): string {
        switch (payment.status) {
            case PaymentStatus.APPROVED:
                return 'Tu pago ha sido aprobado. La reserva está confirmada.';
            case PaymentStatus.REJECTED:
                return 'Tu pago ha sido rechazado. Por favor, intenta nuevamente.';
            case PaymentStatus.CANCELLED:
                return 'Tu pago ha sido cancelado.';
            case PaymentStatus.REFUNDED:
                return 'Tu pago ha sido reembolsado.';
            default:
                return 'El estado de tu pago ha sido actualizado.';
        }
    }

    private mapMercadoPagoStatus(status: string): PaymentStatus {
        switch (status) {
            case 'approved':
                return PaymentStatus.APPROVED;
            case 'rejected':
                return PaymentStatus.REJECTED;
            case 'cancelled':
                return PaymentStatus.CANCELLED;
            case 'refunded':
                return PaymentStatus.REFUNDED;
            default:
                return PaymentStatus.PENDING;
        }
    }
}
