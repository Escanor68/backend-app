import { DataSource, Repository } from 'typeorm';
import { Payment } from '../models/payment.model';
import { logger } from '../utils/logger';
import { MercadoPagoService } from './mercado-pago.service';
import { PaymentStatus } from '../types/payment.types';
import { paymentEvents } from '../events/paymentEvents';
import { v4 as uuidv4 } from 'uuid';

interface CreatePaymentDTO {
    amount: number;
    field: {
        id: string;
        name: string;
        ownerId: string;
        ownerName: string;
        ownerEmail: string;
        location: string;
        price: number;
    };
    booking: {
        id: string;
        startTime: Date;
        endTime: Date;
    };
    userId: string;
    userEmail?: string;
    userName?: string;
}

export class PaymentService {
    private paymentRepository: Repository<Payment>;
    private mercadoPagoService: MercadoPagoService;

    constructor(
        private dataSource: DataSource,
        mercadoPagoService: MercadoPagoService,
    ) {
        this.paymentRepository = dataSource.getRepository(Payment);
        this.mercadoPagoService = mercadoPagoService;
    }

    async createPayment(data: CreatePaymentDTO): Promise<Payment> {
        try {
            logger.info('Creando pago:', data);

            const payment = this.paymentRepository.create({
                amount: data.amount,
                field: data.field,
                booking: { id: data.booking.id },
                user: { id: data.userId },
                status: PaymentStatus.PENDING,
                paymentMethod: 'mercadopago',
                metadata: {
                    userEmail: data.userEmail,
                    userName: data.userName,
                },
            });

            const savedPayment = await this.paymentRepository.save(payment);
            logger.info('Pago creado:', savedPayment);

            return savedPayment;
        } catch (error) {
            logger.error('Error creando pago:', error);
            throw error;
        }
    }

    async getPaymentById(id: string): Promise<Payment | null> {
        try {
            return await this.paymentRepository.findOne({
                where: { id },
                relations: ['field', 'booking', 'user'],
            });
        } catch (error) {
            logger.error('Error obteniendo pago:', error);
            throw error;
        }
    }

    async getPaymentsByUserId(userId: string): Promise<Payment[]> {
        try {
            return await this.paymentRepository.find({
                where: { user: { id: userId } },
                relations: ['field', 'booking'],
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            logger.error('Error obteniendo pagos del usuario:', error);
            throw error;
        }
    }

    async getPaymentsByFieldId(fieldId: string): Promise<Payment[]> {
        try {
            return await this.paymentRepository.find({
                where: { field: { id: fieldId } },
                relations: ['user', 'booking'],
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            logger.error('Error obteniendo pagos del campo:', error);
            throw error;
        }
    }

    async processPayment(paymentId: string): Promise<Payment> {
        try {
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                throw new Error('Pago no encontrado');
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

                const updatedPayment = await this.paymentRepository.save(
                    payment,
                );
                paymentEvents.emitPaymentStatusUpdate(paymentId, newStatus);
                return updatedPayment;
            }

            return payment;
        } catch (error) {
            logger.error('Error procesando pago:', error);
            throw error;
        }
    }

    async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
        try {
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                throw new Error('Pago no encontrado');
            }
            return payment.status;
        } catch (error) {
            logger.error('Error obteniendo estado del pago:', error);
            throw error;
        }
    }

    async requestRefund(paymentId: string, reason: string): Promise<Payment> {
        try {
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                throw new Error('Pago no encontrado');
            }

            const refund = await this.mercadoPagoService.getRefund(paymentId);
            payment.status = PaymentStatus.REFUNDED;
            payment.metadata = {
                ...payment.metadata,
                transactionId: refund.id,
                paymentMethodId: refund.payment_id,
                paymentTypeId: refund.payment_id,
                statusDetail: refund.status,
                externalReference: refund.external_reference,
                description: reason,
            };

            const updatedPayment = await this.paymentRepository.save(payment);
            paymentEvents.emitPaymentStatusUpdate(
                paymentId,
                PaymentStatus.REFUNDED,
            );
            return updatedPayment;
        } catch (error) {
            logger.error('Error solicitando reembolso:', error);
            throw error;
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
