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
        payment.metadata = {
            ...payment.metadata,
            lastRefundUpdate: new Date(),
            refundHistory: [
                ...(payment.metadata?.refundHistory || []),
                {
                    id: mpRefund.id,
                    amount: refundAmount,
                    date: new Date(),
                    status: mpRefund.status,
                },
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
            if (!payment || !payment.refund) {
                throw new Error('No se encontró información de reembolso para este pago');
            }
            if (!payment.refund.mercadoPagoRefundId) {
                return payment.refund; // Devolver info local si no hay ID de MP
            }
            // Consultar estado actualizado en Mercado Pago
            const mpRefund = await this.paymentRefund.get({
                payment_id: payment.mercadoPagoId,
                refund_id: payment.refund.mercadoPagoRefundId,
            });
            // Actualizar estado local si cambió
            if (mpRefund.status !== payment.refund.status) {
                payment.refund.status =
                    mpRefund.status === 'approved' ? 'completed' : 'pending';
                await this.paymentRepository.save(payment);
                // Emitir evento de actualización
                paymentEvents_1.paymentEvents.emitRefundUpdate(payment.id, payment.refund.status, payment.refund.amount, payment.refund.reason);
            }
            return {
                ...payment.refund,
                mercadoPagoStatus: mpRefund.status,
                lastUpdated: new Date(),
            };
        }
        catch (error) {
            console.error('❌ [RefundService] Error obteniendo estado de reembolso:', error);
            throw error;
        }
    }
    /**
     * Lista todos los reembolsos de un usuario
     */
    async getUserRefunds(userId) {
        const payments = await this.paymentRepository.find({
            where: {
                userId,
                refund: { $ne: null },
            },
        });
        return payments
            .filter((payment) => payment.refund)
            .map((payment) => ({
            paymentId: payment.id,
            refund: payment.refund,
            originalAmount: payment.amount,
            paymentDate: payment.createdAt,
        }));
    }
    /**
     * Cancela un reembolso pendiente (si es posible)
     */
    async cancelRefund(paymentId) {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { id: paymentId },
            });
            if (!payment || !payment.refund) {
                throw new Error('No se encontró reembolso para cancelar');
            }
            if (payment.refund.status === 'completed') {
                throw new Error('No se puede cancelar un reembolso ya completado');
            }
            // Aquí iría la lógica para cancelar en MP si es posible
            // Por ahora, solo marcamos como cancelado localmente
            payment.refund.status = 'cancelled';
            payment.refund.metadata = {
                ...payment.refund.metadata,
                cancelledAt: new Date(),
                cancelReason: 'Cancelled by user',
            };
            await this.paymentRepository.save(payment);
            paymentEvents_1.paymentEvents.emitRefundUpdate(payment.id, 'cancelled', payment.refund.amount, 'Cancelled by user');
            return true;
        }
        catch (error) {
            console.error('❌ [RefundService] Error cancelando reembolso:', error);
            throw error;
        }
    }
}
exports.RefundService = RefundService;
//# sourceMappingURL=refund.service.js.map