"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const payment_validator_1 = require("../middleware/validators/payment.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
console.log('🛣️ [PaymentRoutes] Configurando rutas de pagos...');
// Rutas públicas
console.log('📝 [PaymentRoutes] Registrando ruta pública: POST /webhook');
router.post('/webhook', (req, res, next) => {
    console.log('🔗 [PaymentRoutes] Webhook recibido - POST /webhook');
    paymentController.handleWebhook(req, res, next);
});
// Rutas protegidas
console.log('🔒 [PaymentRoutes] Aplicando middleware de autenticación a rutas protegidas');
router.use((0, auth_1.authenticate)());
// Rutas básicas de pago
console.log('📝 [PaymentRoutes] Registrando ruta: POST /preference');
router.post('/preference', payment_validator_1.validatePaymentRequest, (req, res, next) => {
    console.log('🔗 [PaymentRoutes] Crear preferencia de pago - POST /preference');
    paymentController.createPaymentPreference(req, res, next);
});
console.log('📝 [PaymentRoutes] Registrando ruta: GET /:id/status');
router.get('/:id/status', (req, res, next) => {
    console.log('🔗 [PaymentRoutes] Obtener estado de pago - GET /:id/status, ID:', req.params.id);
    paymentController.getPaymentStatus(req, res, next);
});
console.log('📝 [PaymentRoutes] Registrando ruta: GET /history');
router.get('/history', (req, res, next) => {
    console.log('🔗 [PaymentRoutes] Obtener historial de pagos - GET /history');
    paymentController.getPaymentHistory(req, res, next);
});
// Rutas de reembolso
console.log('📝 [PaymentRoutes] Registrando ruta: POST /:id/refund');
router.post('/:id/refund', (req, res) => {
    console.log('🔗 [PaymentRoutes] Procesar reembolso - POST /:id/refund, ID:', req.params.id);
    paymentController.refundPayment(req, res);
});
console.log('📝 [PaymentRoutes] Registrando ruta: GET /:id/refund-status');
router.get('/:id/refund-status', (req, res) => {
    console.log('🔗 [PaymentRoutes] Obtener estado de reembolso - GET /:id/refund-status, ID:', req.params.id);
    paymentController.getRefundStatus(req, res);
});
// Rutas de facturación
console.log('📝 [PaymentRoutes] Registrando ruta: GET /:id/invoice');
router.get('/:id/invoice', (req, res) => {
    console.log('🔗 [PaymentRoutes] Obtener factura - GET /:id/invoice, ID:', req.params.id);
    paymentController.getInvoice(req, res);
});
console.log('📝 [PaymentRoutes] Registrando ruta: POST /:id/invoice/send-email');
router.post('/:id/invoice/send-email', (req, res) => {
    console.log('🔗 [PaymentRoutes] Enviar factura por email - POST /:id/invoice/send-email, ID:', req.params.id);
    paymentController.sendInvoiceEmail(req, res);
});
// Rutas de administrador
console.log('📝 [PaymentRoutes] Registrando ruta de admin: GET /admin/reports');
router.get('/admin/reports', (0, auth_1.requireRole)('admin'), (req, res) => {
    console.log('🔗 [PaymentRoutes] Obtener reportes de pagos (Admin) - GET /admin/reports');
    paymentController.getPaymentReports(req, res);
});
console.log('✅ [PaymentRoutes] Todas las rutas de pagos configuradas exitosamente');
exports.default = router;
//# sourceMappingURL=payment.routes.js.map