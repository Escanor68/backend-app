"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const payment_model_1 = require("../models/payment.model");
const logger_1 = require("../utils/logger");
const payment_types_1 = require("../types/payment.types");
const paymentEvents_1 = require("../events/paymentEvents");
class PaymentService {
    constructor(dataSource, mercadoPagoService) {
        this.dataSource = dataSource;
        this.paymentRepository = dataSource.getRepository(payment_model_1.Payment);
        this.mercadoPagoService = mercadoPagoService;
    }
    async createPayment(data) {
        try {
            logger_1.logger.info('Creando pago:', data);
            const payment = this.paymentRepository.create({
                amount: data.amount,
                field: data.field,
                booking: { id: data.booking.id },
                user: { id: data.userId },
                status: payment_types_1.PaymentStatus.PENDING,
                paymentMethod: 'mercadopago',
                metadata: {
                    userEmail: data.userEmail,
                    userName: data.userName,
                },
            });
            const savedPayment = await this.paymentRepository.save(payment);
            logger_1.logger.info('Pago creado:', savedPayment);
            return savedPayment;
        }
        catch (error) {
            logger_1.logger.error('Error creando pago:', error);
            throw error;
        }
    }
    async getPaymentById(id) {
        try {
            return await this.paymentRepository.findOne({
                where: { id },
                relations: ['field', 'booking', 'user'],
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo pago:', error);
            throw error;
        }
    }
    async getPaymentsByUserId(userId) {
        try {
            return await this.paymentRepository.find({
                where: { user: { id: userId } },
                relations: ['field', 'booking'],
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo pagos del usuario:', error);
            throw error;
        }
    }
    async getPaymentsByFieldId(fieldId) {
        try {
            return await this.paymentRepository.find({
                where: { field: { id: fieldId } },
                relations: ['user', 'booking'],
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo pagos del campo:', error);
            throw error;
        }
    }
    async processPayment(paymentId) {
        try {
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                throw new Error('Pago no encontrado');
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
                const updatedPayment = await this.paymentRepository.save(payment);
                paymentEvents_1.paymentEvents.emitPaymentStatusUpdate(paymentId, newStatus);
                return updatedPayment;
            }
            return payment;
        }
        catch (error) {
            logger_1.logger.error('Error procesando pago:', error);
            throw error;
        }
    }
    async getPaymentStatus(paymentId) {
        try {
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                throw new Error('Pago no encontrado');
            }
            return payment.status;
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo estado del pago:', error);
            throw error;
        }
    }
    async requestRefund(paymentId, reason) {
        try {
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                throw new Error('Pago no encontrado');
            }
            const refund = await this.mercadoPagoService.getRefund(paymentId);
            payment.status = payment_types_1.PaymentStatus.REFUNDED;
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
            paymentEvents_1.paymentEvents.emitPaymentStatusUpdate(paymentId, payment_types_1.PaymentStatus.REFUNDED);
            return updatedPayment;
        }
        catch (error) {
            logger_1.logger.error('Error solicitando reembolso:', error);
            throw error;
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
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map