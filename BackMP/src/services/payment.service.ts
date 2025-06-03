import {
    MercadoPagoConfig,
    Preference,
    Payment as MPPayment,
} from 'mercadopago';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Payment } from '../models/payment.model';
import { config } from '../config';
import {
    PaymentPreferenceData,
    PaymentWebhookData,
    PaymentStatus,
    RefundResult,
} from '../types/payment.types';

export class PaymentService {
    private mercadopago: MercadoPagoConfig;
    private paymentRepository: Repository<Payment>;

    constructor() {
        // Inicializar MercadoPago
        this.mercadopago = new MercadoPagoConfig({
            accessToken: config.mercadoPago.accessToken as string,
        });

        // Inicializar repositorio
        this.paymentRepository = AppDataSource.getRepository(Payment);
    }

    async createPreference(data: PaymentPreferenceData) {
        try {
            const preference = new Preference(this.mercadopago);

            const preferenceData = {
                items: data.items,
                payer: data.payer,
                back_urls: {
                    success: `${config.cors.origin}/payment/success`,
                    failure: `${config.cors.origin}/payment/failure`,
                    pending: `${config.cors.origin}/payment/pending`,
                },
                auto_return: 'approved',
                notification_url: `${config.cors.origin}/api/payments/webhook`,
            };

            const result = await preference.create({ body: preferenceData });

            // Guardar el pago en la base de datos
            const payment = this.paymentRepository.create({
                userId: data.payer.email,
                amount: data.items.reduce(
                    (acc, item) => acc + item.unit_price * item.quantity,
                    0,
                ),
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
        } catch (error) {
            console.error('Error creating preference:', error);
            throw new Error('Failed to create payment preference');
        }
    }

    async processPayment(data: PaymentWebhookData) {
        try {
            const payment = new MPPayment(this.mercadopago);
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
        } catch (error) {
            console.error('Error processing payment:', error);
            throw new Error('Failed to process payment');
        }
    }

    async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
        try {
            const payment = await this.paymentRepository.findOne({
                where: [{ id: paymentId }, { mercadoPagoId: paymentId }],
            });

            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.mercadoPagoId) {
                const mpPayment = new MPPayment(this.mercadopago);
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
        } catch (error) {
            console.error('Error getting payment status:', error);
            throw new Error('Failed to get payment status');
        }
    }

    async getPaymentHistory(userId: string): Promise<Payment[]> {
        try {
            return await this.paymentRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            console.error('Error getting payment history:', error);
            throw new Error('Failed to get payment history');
        }
    }

    async requestRefund(paymentId: string): Promise<RefundResult> {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { mercadoPagoId: paymentId },
            });

            if (!payment) {
                throw new Error('Payment not found');
            }

            const mpPayment = new MPPayment(this.mercadopago);
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
        } catch (error) {
            console.error('Error requesting refund:', error);
            throw new Error('Failed to request refund');
        }
    }
}
