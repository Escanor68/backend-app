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
const webhook_service_1 = require("../services/webhook.service");
const refund_service_1 = require("../services/refund.service");
const audit_service_1 = require("../services/audit.service");
const mercado_pago_service_1 = require("../services/mercado-pago.service");
class PaymentController {
    constructor() {
        this.paymentRepository = database_1.AppDataSource.getRepository(payment_model_1.Payment);
        this.invoiceService = new invoice_service_1.InvoiceService();
        this.webhookService = new webhook_service_1.WebhookService();
        this.refundService = new refund_service_1.RefundService();
        this.auditService = new audit_service_1.AuditService();
        this.createPaymentPreference = async (req, res, next) => {
            try {
                console.log('💳 [PaymentController] createPaymentPreference - Iniciando...');
                console.log('📊 [PaymentController] Request body:', req.body);
                console.log('👤 [PaymentController] Usuario:', req.user);
                const result = await this.paymentService.createPayment(req.body);
                console.log('✅ [PaymentController] Preferencia de pago creada:', result);
                res.status(201).json(result);
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
                const payment = await this.paymentService.processPayment(req.body.paymentId);
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
                // Buscar pagos por userId directamente (campo simple)
                const payments = await this.paymentRepository.find({
                    where: {
                        userId: userId, // Usar el campo userId directamente
                    },
                    order: { createdAt: 'DESC' },
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
        this.requestRefund = async (req, res) => {
            try {
                const { paymentId } = req.params;
                const { reason } = req.body;
                if (!reason) {
                    return res.status(400).json({
                        success: false,
                        message: 'Se requiere una razón para el reembolso',
                    });
                }
                const refund = await this.paymentService.requestRefund(paymentId, reason);
                res.json({
                    success: true,
                    data: refund,
                });
            }
            catch (error) {
                console.error('Error requesting refund:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al solicitar el reembolso',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
        // Método para manejar webhooks (referenciado en las rutas)
        this.handleWebhook = async (req, res) => {
            try {
                const event = req.body;
                await this.webhookService.handleWebhook(event);
                res.status(200).json({ success: true });
            }
            catch (error) {
                console.error('Error handling webhook:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error procesando webhook',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
        this.createPayment = async (req, res) => {
            try {
                const { amount, field, booking, userId, userEmail, userName } = req.body;
                if (!amount || !field || !booking || !userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Faltan datos requeridos',
                    });
                }
                const result = await this.paymentService.createPayment({
                    amount,
                    field,
                    booking,
                    userId,
                    userEmail,
                    userName,
                });
                res.json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                console.error('Error creating payment:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el pago',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
        this.getPaymentById = async (req, res) => {
            try {
                const { id } = req.params;
                const payment = await this.paymentService.getPaymentById(id);
                if (!payment) {
                    return res.status(404).json({
                        success: false,
                        message: 'Pago no encontrado',
                    });
                }
                res.json({
                    success: true,
                    data: payment,
                });
            }
            catch (error) {
                console.error('Error getting payment:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener el pago',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
        this.getPaymentsByUserId = async (req, res) => {
            try {
                const { userId } = req.params;
                const payments = await this.paymentService.getPaymentsByUserId(userId);
                res.json({
                    success: true,
                    data: payments,
                });
            }
            catch (error) {
                console.error('Error getting payments:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los pagos',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
        this.getPaymentsByFieldId = async (req, res) => {
            try {
                const { fieldId } = req.params;
                const payments = await this.paymentService.getPaymentsByFieldId(fieldId);
                res.json({
                    success: true,
                    data: payments,
                });
            }
            catch (error) {
                console.error('Error getting payments:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener los pagos',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
        console.log('🏗️ [PaymentController] Inicializando PaymentController...');
        this.paymentService = new payment_service_1.PaymentService(database_1.AppDataSource, new mercado_pago_service_1.MercadoPagoService());
        console.log('✅ [PaymentController] PaymentController inicializado correctamente');
    }
    async refundPayment(req, res) {
        let amount;
        let reason;
        try {
            console.log('💸 [PaymentController] refundPayment - Iniciando...');
            const { id } = req.params;
            ({ reason, amount } = req.body);
            console.log('🆔 [PaymentController] Payment ID:', id);
            console.log('📊 [PaymentController] Refund data:', {
                reason,
                amount,
            });
            // Registrar auditoría del intento
            await this.auditService.logRefundOperation(req, id, 'refund_request', true, amount, reason);
            // Procesar reembolso real usando el servicio
            const refundResponse = await this.refundService.processRefund({
                paymentId: id,
                amount,
                reason,
                metadata: {
                    requestedBy: req.user?.id,
                    requestIP: req.ip,
                    requestTimestamp: new Date(),
                },
            });
            console.log('✅ [PaymentController] Reembolso procesado correctamente:', refundResponse);
            // Registrar auditoría del éxito
            await this.auditService.logRefundOperation(req, id, 'refund_completed', true, refundResponse.amount, reason);
            return res.json({
                message: 'Reembolso procesado correctamente',
                refund: refundResponse,
            });
        }
        catch (error) {
            console.error('❌ [PaymentController] Error al procesar reembolso:', error);
            // Registrar auditoría del fallo
            await this.auditService.logRefundOperation(req, req.params.id, 'refund_failed', false, amount, reason);
            return res.status(500).json({
                message: 'Error al procesar reembolso',
                error: error instanceof Error
                    ? error.message
                    : 'Error desconocido',
            });
        }
    }
    async getRefundStatus(req, res) {
        try {
            console.log('🔍 [PaymentController] getRefundStatus - Iniciando...');
            const { id } = req.params;
            console.log('🆔 [PaymentController] Payment ID:', id);
            // Registrar acceso a información de reembolso
            await this.auditService.logRefundOperation(req, id, 'refund_status_access', true);
            const refundStatus = await this.refundService.getRefundStatus(id);
            console.log('📋 [PaymentController] Estado del reembolso obtenido:', refundStatus.status);
            return res.json({
                refundStatus: refundStatus.status,
                refundDetails: refundStatus,
            });
        }
        catch (error) {
            console.error('❌ [PaymentController] Error al obtener estado del reembolso:', error);
            await this.auditService.logRefundOperation(req, req.params.id, 'refund_status_error', false);
            return res.status(500).json({
                message: 'Error al obtener estado del reembolso',
                error: error instanceof Error
                    ? error.message
                    : 'Error desconocido',
            });
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
            // Corregir el typing del reduce
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