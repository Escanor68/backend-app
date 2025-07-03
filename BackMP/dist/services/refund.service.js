"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundService = void 0;
const mercadopago_1 = require("mercadopago");
const database_1 = require("../config/database");
const payment_model_1 = require("../models/payment.model");
const config_1 = require("../config");
const paymentEvents_1 = require("../events/paymentEvents");
const logger_1 = require("../utils/logger");
class RefundService {
    constructor() {
        this.paymentRepository = database_1.AppDataSource.getRepository(payment_model_1.Payment);
        if (!config_1.config.mercadoPago.accessToken) {
            throw new Error('Access token de Mercado Pago no configurado para reembolsos');
        }
        this.client = new mercadopago_1.MercadoPagoConfig({
            accessToken: config_1.config.mercadoPago.accessToken,
        });
        this.paymentRefund = new mercadopago_1.PaymentRefund(this.client);
    }
    /**
     * Procesa un reembolso real con Mercado Pago
     */
    async processRefund(request) {
        try {
            console.log(`💸 [RefundService] Iniciando reembolso para pago: ${request.paymentId}`);
            // Buscar el pago en nuestra base de datos
            const payment = await this.paymentRepository.findOne({
                where: { id: request.paymentId },
            });
            if (!payment) {
                throw new Error(`Pago no encontrado: ${request.paymentId}`);
            }
            // Validaciones previas
            await this.validateRefundRequest(payment, request);
            // Calcular monto del reembolso
            const refundAmount = request.amount || payment.amount;
            console.log(`💰 [RefundService] Monto a reembolsar: $${refundAmount}`);
            // Procesar reembolso en Mercado Pago usando el SDK correcto
            const refundData = {
                amount: refundAmount,
                reason: request.reason,
            };
            const mpRefund = await this.paymentRefund.create({
                payment_id: payment.mercadoPagoId,
                body: refundData,
            });
            console.log(`✅ [RefundService] Reembolso creado en MP:`, {
                id: mpRefund.id,
                status: mpRefund.status,
                amount: mpRefund.amount,
            });
            // Actualizar nuestro registro
            await this.updatePaymentWithRefund(payment, mpRefund, request);
            // Emitir eventos
            paymentEvents_1.paymentEvents.emitRefundUpdate(payment.id, mpRefund.status || 'unknown', refundAmount, request.reason);
            const response = {
                id: mpRefund.id.toString(),
                paymentId: payment.id,
                amount: refundAmount,
                status: this.mapMPStatusToOurStatus(mpRefund.status),
                dateCreated: mpRefund.date_created || new Date().toISOString(),
                reason: request.reason,
                metadata: request.metadata,
            };
            console.log(`✅ [RefundService] Reembolso procesado exitosamente:`, response);
            return response;
        }
        catch (error) {
            console.error(`❌ [RefundService] Error procesando reembolso:`, error);
            logger_1.logger.error('Refund processing error:', error);
            throw error;
        }
    }
    /**
     * Valida si un pago puede ser reembolsado
     */
    async validateRefundRequest(payment, request) {
        // Verificar estado del pago
        if (payment.status !== 'approved') {
            throw new Error(`No se puede reembolsar un pago con estado: ${payment.status}`);
        }
        // Verificar si ya tiene reembolso
        if (payment.refund && payment.refund.status === 'completed') {
            throw new Error('Este pago ya fue reembolsado completamente');
        }
        // Verificar que tenga mercadoPagoId
        if (!payment.mercadoPagoId) {
            throw new Error('El pago no tiene ID de Mercado Pago asociado');
        }
        // Verificar tiempo límite (ejemplo: 180 días)
        const paymentDate = new Date(payment.createdAt);
        const now = new Date();
        const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePayment > 180) {
            throw new Error('No se pueden procesar reembolsos después de 180 días');
        }
        // Verificar monto del reembolso
        if (request.amount && request.amount > payment.amount) {
            throw new Error('El monto a reembolsar no puede ser mayor al monto del pago');
        }
        if (request.amount && request.amount <= 0) {
            throw new Error('El monto a reembolsar debe ser mayor a cero');
        }
        console.log('✅ [RefundService] Validaciones de reembolso pasadas');
    }
    /**
     * Actualiza el registro del pago con información del reembolso
     */
    async updatePaymentWithRefund(payment, mpRefund, request) {
        const refundAmount = request.amount || payment.amount;
        payment.refund = {
            id: mpRefund.id,
            status: mpRefund.status === 'approved' ? 'completed' : 'pending',
            reason: request.reason || 'Reembolso solicitado',
            amount: refundAmount,
            date: new Date(),
            mercadoPagoRefundId: mpRefund.id,
            metadata: {
                originalRequest: request,
                mpResponse: {
                    id: mpRefund.id,
                    status: mpRefund.status,
                    date_created: mpRefund.date_created,
                    amount: mpRefund.amount,
                },
            },
        };
        // Actualizar metadata del pago
        const refundHistory = {
            id: mpRefund.id,
            status: mpRefund.status,
            reason: request.reason || 'Reembolso solicitado',
            amount: refundAmount,
            date: new Date(),
            mercadoPagoRefundId: mpRefund.id,
            metadata: {
                originalRequest: request,
                mpResponse: {
                    id: mpRefund.id,
                    status: mpRefund.status,
                    date_created: mpRefund.date_created,
                    amount: mpRefund.amount,
                },
            },
        };
        payment.metadata = {
            ...payment.metadata,
            lastRefundUpdate: new Date(),
            refundHistory: [
                ...(payment.metadata?.refundHistory || []),
                refundHistory,
            ],
        };
        await this.paymentRepository.save(payment);
        console.log('💾 [RefundService] Pago actualizado con información del reembolso');
    }
    /**
     * Mapea estados de MP a nuestros estados
     */
    mapMPStatusToOurStatus(mpStatus) {
        switch (mpStatus) {
            case 'approved':
                return 'approved';
            case 'rejected':
            case 'cancelled':
                return 'rejected';
            default:
                return 'pending';
        }
    }
    /**
     * Obtiene el estado de un reembolso desde Mercado Pago
     */
    async getRefundStatus(paymentId) {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });
            if (!payment) {
                throw new Error(`Pago no encontrado: ${paymentId}`);
            }
            if (!payment.mercadoPagoId) {
                throw new Error('El pago no tiene ID de Mercado Pago asociado');
            }
            if (!payment.refund?.mercadoPagoRefundId) {
                throw new Error('El pago no tiene ID de reembolso de Mercado Pago asociado');
            }
            const refund = await this.paymentRefund.get({
                payment_id: payment.mercadoPagoId,
                refund_id: payment.refund.mercadoPagoRefundId,
            });
            return {
                id: refund.id,
                status: refund.status,
                amount: refund.amount,
                dateCreated: refund.date_created,
            };
        }
        catch (error) {
            console.error('Error getting refund status:', error);
            throw error;
        }
    }
    /**
     * Obtiene el historial de reembolsos de un usuario
     */
    async getUserRefunds(userId) {
        try {
            const payments = await this.paymentRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
            return payments
                .filter((payment) => payment.refund)
                .map((payment) => ({
                paymentId: payment.id,
                amount: payment.amount,
                status: payment.status,
                refund: payment.refund,
                createdAt: payment.createdAt,
            }));
        }
        catch (error) {
            console.error('Error getting user refunds:', error);
            throw error;
        }
    }
    /**
     * Cancela un reembolso pendiente
     */
    async cancelRefund(paymentId) {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });
            if (!payment) {
                throw new Error(`Pago no encontrado: ${paymentId}`);
            }
            if (!payment.refund || payment.refund.status !== 'pending') {
                throw new Error('No hay un reembolso pendiente para cancelar');
            }
            // Actualizar el estado del reembolso
            payment.refund.status = 'cancelled';
            payment.refund.metadata = {
                ...payment.refund.metadata,
                cancelledAt: new Date(),
            };
            await this.paymentRepository.save(payment);
            return true;
        }
        catch (error) {
            console.error('Error cancelling refund:', error);
            throw error;
        }
    }
}
exports.RefundService = RefundService;
//# sourceMappingURL=refund.service.js.map