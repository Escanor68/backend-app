import mercadopago from 'mercadopago';
import { Payment, PaymentStatus } from '../entities/Payment.entity';
import { getRepository } from 'typeorm';

export interface CreatePreferenceData {
    items: Array<{
        title: string;
        quantity: number;
        currency_id: string;
        unit_price: number;
    }>;
    payer: {
        email: string;
    };
    external_reference?: string;
    notification_url?: string;
}

export class MercadoPagoService {
    private static readonly paymentRepository = getRepository(Payment);

    static initialize() {
        mercadopago.configure({
            access_token: process.env.MP_ACCESS_TOKEN || ''
        });
    }

    static async createPreference(data: CreatePreferenceData) {
        try {
            const preference = await mercadopago.preferences.create(data);
            return preference;
        } catch (error) {
            console.error('Error creating preference:', error);
            throw error;
        }
    }

    static async createPayment(userId: string, amount: number, description: string) {
        const payment = this.paymentRepository.create({
            userId,
            amount,
            description,
            status: PaymentStatus.PENDING,
            currency: 'ARS'
        });

        return this.paymentRepository.save(payment);
    }

    static async handleWebhook(data: any) {
        try {
            if (data.type === 'payment') {
                const paymentInfo = await mercadopago.payment.findById(data.data.id);
                const payment = await this.paymentRepository.findOne({
                    where: { mpPreferenceId: paymentInfo.body.preference_id }
                });

                if (!payment) {
                    console.error('Payment not found for preference:', paymentInfo.body.preference_id);
                    return;
                }

                payment.mpPaymentId = paymentInfo.body.id.toString();
                payment.status = this.mapMPStatus(paymentInfo.body.status);
                payment.paymentMethod = paymentInfo.body.payment_method_id;
                payment.installments = paymentInfo.body.installments;
                payment.transactionAmount = paymentInfo.body.transaction_amount;
                payment.mpResponse = paymentInfo.body;

                await this.paymentRepository.save(payment);
            }
        } catch (error) {
            console.error('Error processing webhook:', error);
            throw error;
        }
    }

    private static mapMPStatus(mpStatus: string): PaymentStatus {
        switch (mpStatus) {
            case 'approved':
                return PaymentStatus.APPROVED;
            case 'rejected':
                return PaymentStatus.REJECTED;
            case 'refunded':
                return PaymentStatus.REFUNDED;
            case 'cancelled':
                return PaymentStatus.CANCELLED;
            default:
                return PaymentStatus.PENDING;
        }
    }

    static async getPaymentById(id: string) {
        return this.paymentRepository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    static async getUserPayments(userId: string) {
        return this.paymentRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
    }

    static async refundPayment(paymentId: string) {
        try {
            const refund = await mercadopago.refund.create({ payment_id: parseInt(paymentId) });
            const payment = await this.paymentRepository.findOne({
                where: { mpPaymentId: paymentId }
            });

            if (payment) {
                payment.status = PaymentStatus.REFUNDED;
                payment.mpResponse = { ...payment.mpResponse, refund };
                await this.paymentRepository.save(payment);
            }

            return refund;
        } catch (error) {
            console.error('Error refunding payment:', error);
            throw error;
        }
    }
} 