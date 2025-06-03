"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const mercadopago_1 = require("mercadopago");
const database_1 = require("../config/database");
const payment_model_1 = require("../models/payment.model");
const config_1 = require("../config");
class PaymentService {
    constructor() {
        // Inicializar MercadoPago
        this.mercadopago = new mercadopago_1.MercadoPagoConfig({
            accessToken: config_1.config.mercadoPago.accessToken,
        });
        // Inicializar repositorio
        this.paymentRepository = database_1.AppDataSource.getRepository(payment_model_1.Payment);
    }
    async createPreference(data) {
        try {
            const preference = new mercadopago_1.Preference(this.mercadopago);
            const preferenceData = {
                items: data.items,
                payer: data.payer,
                back_urls: {
                    success: `${config_1.config.cors.origin}/payment/success`,
                    failure: `${config_1.config.cors.origin}/payment/failure`,
                    pending: `${config_1.config.cors.origin}/payment/pending`,
                },
                auto_return: 'approved',
                notification_url: `${config_1.config.cors.origin}/api/payments/webhook`,
            };
            const result = await preference.create({ body: preferenceData });
            // Guardar el pago en la base de datos
            const payment = this.paymentRepository.create({
                userId: data.payer.email,
                amount: data.items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0),
                currency: data.items[0].currency_id,
                status: 'PENDING',
                preferenceId: result.id,
                metadata: {
                    items: data.items,
                    preference: result,
                },
            });
            await this.paymentRepository.save(payment);
            return result;
        }
        catch (error) {
            console.error('Error creating preference:', error);
            throw new Error('Failed to create payment preference');
        }
    }
    async processPayment(data) {
        try {
            const payment = new mercadopago_1.Payment(this.mercadopago);
            const paymentInfo = await payment.get({ id: data.payment_id });
            // Actualizar el pago en la base de datos
            const existingPayment = await this.paymentRepository.findOne({
                where: { preferenceId: data.preference_id },
            });
            if (existingPayment) {
                existingPayment.status = paymentInfo.status;
                existingPayment.mercadoPagoId = paymentInfo.id;
                existingPayment.metadata = {
                    ...existingPayment.metadata,
                    payment: paymentInfo,
                };
                await this.paymentRepository.save(existingPayment);
            }
            return paymentInfo;
        }
        catch (error) {
            console.error('Error processing payment:', error);
            throw new Error('Failed to process payment');
        }
    }
    async getPaymentStatus(paymentId) {
        try {
            const payment = await this.paymentRepository.findOne({
                where: [{ id: paymentId }, { mercadoPagoId: paymentId }],
            });
            if (!payment) {
                throw new Error('Payment not found');
            }
            if (payment.mercadoPagoId) {
                const mpPayment = new mercadopago_1.Payment(this.mercadopago);
                const paymentInfo = await mpPayment.get({
                    id: payment.mercadoPagoId,
                });
                // Actualizar estado si ha cambiado
                if (payment.status !== paymentInfo.status) {
                    payment.status = paymentInfo.status;
                    await this.paymentRepository.save(payment);
                }
                return {
                    id: payment.id,
                    status: paymentInfo.status,
                    detail: paymentInfo.status_detail,
                    preferenceId: payment.preferenceId,
                    mercadoPagoId: payment.mercadoPagoId,
                };
            }
            return {
                id: payment.id,
                status: payment.status,
                detail: 'Local payment status',
                preferenceId: payment.preferenceId,
                mercadoPagoId: payment.mercadoPagoId,
            };
        }
        catch (error) {
            console.error('Error getting payment status:', error);
            throw new Error('Failed to get payment status');
        }
    }
    async getPaymentHistory(userId) {
        try {
            return await this.paymentRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            console.error('Error getting payment history:', error);
            throw new Error('Failed to get payment history');
        }
    }
    async requestRefund(paymentId) {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { mercadoPagoId: paymentId },
            });
            if (!payment) {
                throw new Error('Payment not found');
            }
            const mpPayment = new mercadopago_1.Payment(this.mercadopago);
            const refund = await mpPayment.refund({ payment_id: paymentId });
            // Actualizar el estado del pago
            payment.refundId = refund.id;
            payment.refundStatus = 'REFUNDED';
            payment.metadata = {
                ...payment.metadata,
                refund,
            };
            await this.paymentRepository.save(payment);
            return refund;
        }
        catch (error) {
            console.error('Error requesting refund:', error);
            throw new Error('Failed to request refund');
        }
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map