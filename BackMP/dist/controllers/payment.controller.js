"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
const logger_1 = require("../utils/logger");
const paymentEvents_1 = require("../events/paymentEvents");
const database_1 = require("../config/database");
const payment_model_1 = require("../models/payment.model");
const invoice_service_1 = require("../services/invoice.service");
const typeorm_1 = require("typeorm");
class PaymentController {
    constructor() {
        this.paymentRepository = database_1.AppDataSource.getRepository(payment_model_1.Payment);
        this.invoiceService = new invoice_service_1.InvoiceService();
        this.createPaymentPreference = async (req, res, next) => {
            try {
                console.log('💳 [PaymentController] createPaymentPreference - Iniciando...');
                console.log('📊 [PaymentController] Request body:', req.body);
                console.log('👤 [PaymentController] Usuario:', req.user);
                const preference = await this.paymentService.createPreference(req.body);
                console.log('✅ [PaymentController] Preferencia de pago creada:', preference);
                res.status(201).json(preference);
            }
            catch (error) {
                console.error('❌ [PaymentController] Error creating payment preference:', error);
                logger_1.logger.error('Error creating payment preference:', error);
                next(error);
            }
        };
        this.processPayment = async (req, res, next) => {
            try {
                console.log('⚡ [PaymentController] processPayment - Iniciando...');
                console.log('📊 [PaymentController] Request body:', req.body);
                const payment = await this.paymentService.processPayment(req.body);
                console.log('💰 [PaymentController] Pago procesado:', payment);
                // Emitir evento de actualización de estado
                console.log('📡 [PaymentController] Emitiendo evento de actualización de estado:', payment.id, payment.status);
                paymentEvents_1.paymentEvents.emitPaymentStatusUpdate(payment.id, payment.status);
                res.status(200).json(payment);
            }
            catch (error) {
                console.error('❌ [PaymentController] Error processing payment:', error);
                logger_1.logger.error('Error processing payment:', error);
                next(error);
            }
        };
        this.getPaymentStatus = async (req, res, next) => {
            try {
                console.log('🔍 [PaymentController] getPaymentStatus - Iniciando...');
                console.log('🆔 [PaymentController] Payment ID:', req.params.id);
                const status = await this.paymentService.getPaymentStatus(req.params.id);
                console.log('📊 [PaymentController] Estado del pago obtenido:', status);
                // Emitir evento de actualización de estado
                console.log('📡 [PaymentController] Emitiendo evento de actualización de estado');
                paymentEvents_1.paymentEvents.emitPaymentStatusUpdate(req.params.id, status);
                res.status(200).json(status);
            }
            catch (error) {
                console.error('❌ [PaymentController] Error getting payment status:', error);
                logger_1.logger.error('Error getting payment status:', error);
                next(error);
            }
        };
        this.getPaymentHistory = async (req, res, next) => {
            try {
                console.log('📋 [PaymentController] getPaymentHistory - Iniciando...');
                // Validar que el usuario esté autenticado
                if (!req.user || !req.user.id) {
                    console.log('❌ [PaymentController] Usuario no autenticado');
                    return res.status(401).json({
                        message: 'Usuario no autenticado',
                    });
                }
                console.log('👤 [PaymentController] Usuario ID:', req.user.id);
                const userId = req.user.id;
                // Buscar pagos por usuario - asumiendo que hay un campo user o userId en Payment
                const payments = await this.paymentRepository.find({
                    where: {
                        user: { id: userId }, // Asumiendo relación con User
                    },
                    order: { createdAt: 'DESC' },
                    relations: ['user'], // Incluir la relación user si existe
                });
                console.log(`📊 [PaymentController] Se encontraron ${payments.length} pagos para el usuario ${userId}`);
                return res.json({
                    payments: payments.map((payment) => ({
                        id: payment.id,
                        bookingId: payment.bookingId,
                        amount: payment.amount,
                        status: payment.status,
                        paymentMethod: payment.paymentMethod,
                        createdAt: payment.createdAt,
                        field: payment.field,
                    })),
                });
            }
            catch (error) {
                console.error('❌ [PaymentController] Error getting payment history:', error);
                logger_1.logger.error('Error getting payment history:', error);
                next(error);
            }
        };
        this.requestRefund = async (req, res, next) => {
            try {
                console.log('🔄 [PaymentController] requestRefund - Iniciando...');
                console.log('🆔 [PaymentController] Payment ID:', req.params.id);
                console.log('📊 [PaymentController] Request body:', req.body);
                const refund = await this.paymentService.requestRefund(req.params.id);
                console.log('✅ [PaymentController] Reembolso solicitado:', refund);
                // Emitir evento de actualización de reembolso
                console.log('📡 [PaymentController] Emitiendo evento de actualización de reembolso');
                paymentEvents_1.paymentEvents.emitRefundUpdate(req.params.id, refund.status);
                res.status(200).json(refund);
            }
            catch (error) {
                console.error('❌ [PaymentController] Error requesting refund:', error);
                logger_1.logger.error('Error requesting refund:', error);
                next(error);
            }
        };
        // Método para manejar webhooks (referenciado en las rutas)
        this.handleWebhook = async (req, res, next) => {
            try {
                console.log('🎣 [PaymentController] handleWebhook - Iniciando...');
                console.log('📊 [PaymentController] Webhook body:', req.body);
                console.log('🔍 [PaymentController] Headers:', req.headers);
                // Aquí iría la lógica para procesar el webhook
                // Por ejemplo, validar la firma, procesar el evento, etc.
                console.log('✅ [PaymentController] Webhook procesado correctamente');
                res.status(200).json({ message: 'Webhook procesado' });
            }
            catch (error) {
                console.error('❌ [PaymentController] Error processing webhook:', error);
                logger_1.logger.error('Error processing webhook:', error);
                next(error);
            }
        };
        console.log('🏗️ [PaymentController] Inicializando PaymentController...');
        this.paymentService = new payment_service_1.PaymentService();
        console.log('✅ [PaymentController] PaymentController inicializado correctamente');
    }
    async refundPayment(req, res) {
        try {
            console.log('💸 [PaymentController] refundPayment - Iniciando...');
            const { id } = req.params;
            const { reason, amount } = req.body;
            console.log('🆔 [PaymentController] Payment ID:', id);
            console.log('📊 [PaymentController] Refund data:', {
                reason,
                amount,
            });
            const payment = await this.paymentRepository.findOne({
                where: { id },
            });
            if (!payment) {
                console.log('❌ [PaymentController] Pago no encontrado:', id);
                return res.status(404).json({ message: 'Pago no encontrado' });
            }
            console.log('📋 [PaymentController] Pago encontrado:', payment);
            if (payment.refund) {
                console.log('⚠️ [PaymentController] Este pago ya fue reembolsado:', payment.refund);
                return res
                    .status(400)
                    .json({ message: 'Este pago ya fue reembolsado' });
            }
            console.log('💰 [PaymentController] Procesando reembolso en MercadoPago...');
            // Realizar reembolso en MercadoPago
            // ... lógica de reembolso con MercadoPago ...
            payment.refund = {
                status: 'completed',
                reason,
                amount: amount || payment.amount,
                date: new Date(),
            };
            console.log('💾 [PaymentController] Guardando información del reembolso:', payment.refund);
            await this.paymentRepository.save(payment);
            console.log('✅ [PaymentController] Reembolso procesado correctamente');
            return res.json({ message: 'Reembolso procesado correctamente' });
        }
        catch (error) {
            console.error('❌ [PaymentController] Error al procesar reembolso:', error);
            return res
                .status(500)
                .json({ message: 'Error al procesar reembolso' });
        }
    }
    async getRefundStatus(req, res) {
        try {
            console.log('🔍 [PaymentController] getRefundStatus - Iniciando...');
            const { id } = req.params;
            console.log('🆔 [PaymentController] Payment ID:', id);
            const payment = await this.paymentRepository.findOne({
                where: { id },
            });
            if (!payment) {
                console.log('❌ [PaymentController] Pago no encontrado:', id);
                return res.status(404).json({ message: 'Pago no encontrado' });
            }
            console.log('📋 [PaymentController] Pago encontrado, estado del reembolso:', payment.refund?.status || 'no_refund');
            return res.json({
                refundStatus: payment.refund?.status || 'no_refund',
                refundDetails: payment.refund,
            });
        }
        catch (error) {
            console.error('❌ [PaymentController] Error al obtener estado del reembolso:', error);
            return res
                .status(500)
                .json({ message: 'Error al obtener estado del reembolso' });
        }
    }
    async getPaymentReports(req, res) {
        try {
            console.log('📊 [PaymentController] getPaymentReports - Iniciando...');
            const { startDate, endDate, status } = req.query;
            console.log('📅 [PaymentController] Filtros de reporte:', {
                startDate,
                endDate,
                status,
            });
            const whereClause = {};
            if (startDate && endDate) {
                whereClause.createdAt = (0, typeorm_1.Between)(new Date(startDate), new Date(endDate));
                console.log('📅 [PaymentController] Filtro de fechas aplicado:', whereClause.createdAt);
            }
            if (status) {
                whereClause.status = status;
                console.log('📊 [PaymentController] Filtro de estado aplicado:', status);
            }
            const payments = await this.paymentRepository.find({
                where: whereClause,
            });
            console.log(`📋 [PaymentController] Se encontraron ${payments.length} pagos para el reporte`);
            // Corregir el tipado del reduce
            const paymentsByStatus = payments.reduce((acc, payment) => {
                const status = payment.status;
                if (!acc[status]) {
                    acc[status] = { status, count: 0, amount: 0 };
                }
                acc[status].count++;
                acc[status].amount += Number(payment.amount);
                return acc;
            }, {});
            return res.json({
                totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
                totalPayments: payments.length,
                paymentsByStatus: Object.values(paymentsByStatus),
            });
        }
        catch (error) {
            console.error('❌ [PaymentController] Error al generar reporte:', error);
            return res
                .status(500)
                .json({ message: 'Error al generar reporte' });
        }
    }
    async getInvoice(req, res) {
        try {
            console.log('📄 [PaymentController] getInvoice - Iniciando...');
            const { id } = req.params;
            console.log('🆔 [PaymentController] Payment ID:', id);
            const payment = await this.paymentRepository.findOne({
                where: { id },
            });
            if (!payment) {
                console.log('❌ [PaymentController] Pago no encontrado:', id);
                return res.status(404).json({ message: 'Pago no encontrado' });
            }
            console.log('📋 [PaymentController] Pago encontrado:', payment);
            if (!payment.invoice) {
                console.log('📄 [PaymentController] Generando factura...');
                // Generar factura si no existe
                await this.invoiceService.generateInvoice(payment);
            }
            // Verificar nuevamente que la factura existe después de generarla
            if (!payment.invoice) {
                console.log('❌ [PaymentController] No se pudo generar la factura');
                return res
                    .status(500)
                    .json({ message: 'Error al generar factura' });
            }
            console.log('✅ [PaymentController] Enviando factura:', payment.invoice.url);
            return res.download(payment.invoice.url);
        }
        catch (error) {
            console.error('❌ [PaymentController] Error al obtener factura:', error);
            return res
                .status(500)
                .json({ message: 'Error al obtener factura' });
        }
    }
    async sendInvoiceEmail(req, res) {
        try {
            console.log('📧 [PaymentController] sendInvoiceEmail - Iniciando...');
            const { id } = req.params;
            const { email } = req.body;
            console.log('🆔 [PaymentController] Payment ID:', id);
            console.log('📧 [PaymentController] Email destino:', email);
            const payment = await this.paymentRepository.findOne({
                where: { id },
            });
            if (!payment) {
                console.log('❌ [PaymentController] Pago no encontrado:', id);
                return res.status(404).json({ message: 'Pago no encontrado' });
            }
            if (!payment.invoice) {
                console.log('📄 [PaymentController] Generando factura para envío...');
                await this.invoiceService.generateInvoice(payment);
            }
            console.log('📧 [PaymentController] Enviando factura por email...');
            await this.invoiceService.sendInvoiceEmail(payment, email);
            console.log('✅ [PaymentController] Factura enviada correctamente');
            return res.json({ message: 'Factura enviada correctamente' });
        }
        catch (error) {
            console.error('❌ [PaymentController] Error al enviar factura:', error);
            return res.status(500).json({ message: 'Error al enviar factura' });
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map