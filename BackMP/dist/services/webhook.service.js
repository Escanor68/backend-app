"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
const payment_model_1 = require("../models/payment.model");
const booking_model_1 = require("../models/booking.model");
const field_model_1 = require("../models/field.model");
const user_model_1 = require("../models/user.model");
const logger_1 = require("../utils/logger");
const payment_types_1 = require("../types/payment.types");
const booking_types_1 = require("../types/booking.types");
const notification_service_1 = require("./notification.service");
const mercado_pago_service_1 = require("./mercado-pago.service");
class WebhookService {
    constructor() {
        this.paymentRepository = database_1.AppDataSource.getRepository(payment_model_1.Payment);
        this.bookingRepository = database_1.AppDataSource.getRepository(booking_model_1.Booking);
        this.fieldRepository = database_1.AppDataSource.getRepository(field_model_1.Field);
        this.userRepository = database_1.AppDataSource.getRepository(user_model_1.User);
        this.notificationService = new notification_service_1.NotificationService();
        this.mercadoPagoService = new mercado_pago_service_1.MercadoPagoService();
        this.mercadoPagoSecret = process.env.MP_WEBHOOK_SECRET || '';
        if (!this.mercadoPagoSecret) {
            console.warn('⚠️ [WebhookService] MP_WEBHOOK_SECRET no configurado - webhooks no serán seguros');
        }
    }
    /**
     * Valida la firma del webhook de Mercado Pago
     */
    validateSignature(body, signature, timestamp) {
        try {
            if (!this.mercadoPagoSecret) {
                console.warn('⚠️ [WebhookService] No se puede validar firma - secreto no configurado');
                return false;
            }
            // Extraer componentes de la firma
            const signatureParts = signature.split(',');
            const tsParam = signatureParts.find((part) => part.startsWith('ts='));
            const v1Param = signatureParts.find((part) => part.startsWith('v1='));
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
                console.error('❌ [WebhookService] Webhook expirado - timestamp muy antiguo');
                return false;
            }
            // Crear firma esperada
            const payload = `id=${body.data?.id}&topic=${body.type}&timestamp=${ts}`;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.mercadoPagoSecret)
                .update(payload)
                .digest('hex');
            const isValid = crypto_1.default.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expectedSignature, 'hex'));
            if (!isValid) {
                console.error('❌ [WebhookService] Firma inválida');
                return false;
            }
            console.log('✅ [WebhookService] Firma válida');
            return true;
        }
        catch (error) {
            console.error('❌ [WebhookService] Error validando firma:', error);
            return false;
        }
    }
    /**
     * Procesa un evento de webhook de Mercado Pago
     */
    async handleWebhook(event) {
        try {
            logger_1.logger.info('Webhook recibido:', event);
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
                    logger_1.logger.warn('Tipo de webhook no manejado:', event.type);
            }
        }
        catch (error) {
            logger_1.logger.error('Error procesando webhook:', error);
            throw error;
        }
    }
    async handlePaymentWebhook(event) {
        try {
            const paymentId = event.data.id;
            const payment = await this.paymentRepository.findOne({
                where: { externalId: paymentId },
                relations: ['booking', 'field', 'user'],
            });
            if (!payment) {
                logger_1.logger.warn('Pago no encontrado:', paymentId);
                return;
            }
            const paymentInfo = await this.mercadoPagoService.getPayment(paymentId);
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
        }
        catch (error) {
            logger_1.logger.error('Error procesando webhook de pago:', error);
            throw error;
        }
    }
    async handleRefundWebhook(event) {
        try {
            const refundId = event.data.id;
            const refund = await this.mercadoPagoService.getRefund(refundId);
            const payment = await this.paymentRepository.findOne({
                where: { externalId: refund.payment_id },
                relations: ['booking', 'field', 'user'],
            });
            if (!payment) {
                logger_1.logger.warn('Pago no encontrado para reembolso:', refund.payment_id);
                return;
            }
            payment.status = payment_types_1.PaymentStatus.REFUNDED;
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
        }
        catch (error) {
            logger_1.logger.error('Error procesando webhook de reembolso:', error);
            throw error;
        }
    }
    /**
     * Maneja eventos de merchant order
     */
    async handleMerchantOrderEvent(event) {
        console.log(`🏪 [WebhookService] Procesando merchant order: ${event.data.id}`);
        // Aquí se puede implementar lógica para órdenes de comercio si es necesario
    }
    async updateBookingStatus(payment) {
        try {
            if (!payment.booking)
                return;
            const booking = await this.bookingRepository.findOne({
                where: { id: payment.booking.id },
            });
            if (!booking) {
                logger_1.logger.warn('Reserva no encontrada:', payment.booking.id);
                return;
            }
            let newStatus;
            switch (payment.status) {
                case payment_types_1.PaymentStatus.APPROVED:
                    newStatus = booking_types_1.BookingStatus.CONFIRMED;
                    break;
                case payment_types_1.PaymentStatus.REJECTED:
                case payment_types_1.PaymentStatus.CANCELLED:
                case payment_types_1.PaymentStatus.REFUNDED:
                    newStatus = booking_types_1.BookingStatus.CANCELLED;
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
        }
        catch (error) {
            logger_1.logger.error('Error actualizando estado de reserva:', error);
            throw error;
        }
    }
    async notifyUser(payment) {
        try {
            if (!payment.user)
                return;
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
        }
        catch (error) {
            logger_1.logger.error('Error notificando al usuario:', error);
        }
    }
    getStatusMessage(payment) {
        switch (payment.status) {
            case payment_types_1.PaymentStatus.APPROVED:
                return 'Tu pago ha sido aprobado. La reserva está confirmada.';
            case payment_types_1.PaymentStatus.REJECTED:
                return 'Tu pago ha sido rechazado. Por favor, intenta nuevamente.';
            case payment_types_1.PaymentStatus.CANCELLED:
                return 'Tu pago ha sido cancelado.';
            case payment_types_1.PaymentStatus.REFUNDED:
                return 'Tu pago ha sido reembolsado.';
            default:
                return 'El estado de tu pago ha sido actualizado.';
        }
    }
    mapMercadoPagoStatus(status) {
        switch (status) {
            case 'approved':
                return payment_types_1.PaymentStatus.APPROVED;
            case 'rejected':
                return payment_types_1.PaymentStatus.REJECTED;
            case 'cancelled':
                return payment_types_1.PaymentStatus.CANCELLED;
            case 'refunded':
                return payment_types_1.PaymentStatus.REFUNDED;
            default:
                return payment_types_1.PaymentStatus.PENDING;
        }
    }
}
exports.WebhookService = WebhookService;
//# sourceMappingURL=webhook.service.js.map