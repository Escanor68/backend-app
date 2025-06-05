import { Preference, Payment as MPPayment } from 'mercadopago';
import { config } from '../config';
import { AppDataSource } from '../config/database';
import { Payment } from '../models/payment.model';

export class PaymentService {
    private preference: Preference;
    private mpPayment: MPPayment;
    private paymentRepository = AppDataSource.getRepository(Payment);

    constructor() {
        console.log('🏗️ [PaymentService] Inicializando PaymentService...');

        if (!config.mercadoPago.accessToken) {
            throw new Error('Access token de Mercado Pago no configurado');
        }

        this.preference = new Preference({
            accessToken: config.mercadoPago.accessToken,
        });

        this.mpPayment = new MPPayment({
            accessToken: config.mercadoPago.accessToken,
        });

        console.log(
            '✅ [PaymentService] PaymentService inicializado correctamente',
        );
    }

    async createPreference(data: any): Promise<any> {
        try {
            console.log('💳 [PaymentService] Creando preferencia de pago...');
            console.log('📊 [PaymentService] Datos recibidos:', data);

            const preferenceData: any = {
                items: [
                    {
                        id: `booking-${data.bookingId || 'default'}`,
                        title: data.title || 'Reserva de cancha',
                        quantity: 1,
                        currency_id: 'ARS',
                        unit_price: data.amount || 100,
                    },
                ],
                payer: data.payer || { email: 'default@example.com' },
                back_urls: {
                    success: `${config.cors.origin}/payment/success`,
                    failure: `${config.cors.origin}/payment/failure`,
                    pending: `${config.cors.origin}/payment/pending`,
                },
                auto_return: 'approved',
                notification_url: `${config.cors.origin}/api/payments/webhook`,
            };

            const result = await this.preference.create({
                body: preferenceData,
            });

            // Guardar el pago en la base de datos
            const payment = this.paymentRepository.create({
                amount: data.amount || 100,
                status: 'pending',
                paymentMethod: 'mercadopago',
                bookingId: data.bookingId || '',
                preferenceId: result.id,
                field: {
                    id: 'default',
                    name: 'Cancha por defecto',
                },
                userId: 'default-user',
            } as any);

            await this.paymentRepository.save(payment);

            console.log('✅ [PaymentService] Preferencia creada:', result.id);
            return result;
        } catch (error) {
            console.error(
                '❌ [PaymentService] Error creando preferencia:',
                error,
            );
            throw error;
        }
    }

    async processPayment(paymentData: any): Promise<Payment> {
        try {
            console.log('⚡ [PaymentService] Procesando pago...');

            const payment = await this.paymentRepository.findOne({
                where: { preferenceId: paymentData.preference_id },
            });

            if (payment) {
                const paymentInfo = await this.mpPayment.get({
                    id: paymentData.payment_id,
                });

                payment.status = paymentInfo.status || 'unknown';
                payment.mercadoPagoId = String(paymentInfo.id) || '';
                payment.metadata = {
                    ...payment.metadata,
                    paymentInfo,
                    lastUpdate: new Date(),
                };

                await this.paymentRepository.save(payment);
                console.log(
                    '✅ [PaymentService] Pago actualizado:',
                    payment.id,
                );
                return payment;
            }

            throw new Error('Pago no encontrado');
        } catch (error) {
            console.error('❌ [PaymentService] Error procesando pago:', error);
            throw error;
        }
    }

    async getPaymentStatus(paymentId: string): Promise<any> {
        try {
            console.log(
                '🔍 [PaymentService] Obteniendo estado del pago:',
                paymentId,
            );

            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });

            if (payment) {
                if (payment.mercadoPagoId) {
                    const paymentInfo = await this.mpPayment.get({
                        id: payment.mercadoPagoId,
                    });

                    payment.status = paymentInfo.status || 'unknown';
                    await this.paymentRepository.save(payment);
                }

                return {
                    id: payment.id,
                    status: payment.status || 'unknown',
                    detail:
                        payment.metadata?.statusDetail || 'Estado desconocido',
                    preferenceId: payment.preferenceId,
                };
            }

            throw new Error('Pago no encontrado');
        } catch (error) {
            console.error(
                '❌ [PaymentService] Error obteniendo estado:',
                error,
            );
            throw error;
        }
    }

    async requestRefund(paymentId: string): Promise<any> {
        try {
            console.log(
                '🔄 [PaymentService] Solicitando reembolso para:',
                paymentId,
            );

            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });

            if (!payment || !payment.mercadoPagoId) {
                throw new Error('Pago no encontrado o sin ID de Mercado Pago');
            }

            // Por ahora, solo marcamos como reembolso solicitado
            // La implementación real está en RefundService
            if (!payment.refund) {
                payment.refund = {
                    id: '',
                    status: 'pending',
                    reason: 'Reembolso solicitado',
                    amount: payment.amount,
                    date: new Date(),
                };
            }

            await this.paymentRepository.save(payment);

            console.log('✅ [PaymentService] Reembolso solicitado');
            return payment.refund;
        } catch (error) {
            console.error(
                '❌ [PaymentService] Error solicitando reembolso:',
                error,
            );
            throw error;
        }
    }
}
