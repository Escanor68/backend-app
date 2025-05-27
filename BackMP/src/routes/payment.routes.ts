import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validatePaymentRequest } from '../middleware/validators/payment.validator';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// Rutas públicas
router.post('/webhook', paymentController.handleWebhook);

// Rutas protegidas
router.use(authenticate());

// Rutas básicas de pago
router.post('/preference', validatePaymentRequest, paymentController.createPreference);
router.get('/:id/status', paymentController.getPaymentStatus);
router.get('/history', paymentController.getPaymentHistory);

// Rutas de reembolso
router.post('/:id/refund', paymentController.refundPayment);
router.get('/:id/refund-status', paymentController.getRefundStatus);

// Rutas de facturación
router.get('/:id/invoice', paymentController.getInvoice);
router.post('/:id/invoice/send-email', paymentController.sendInvoiceEmail);

// Rutas de administrador
router.get('/admin/reports', requireRole('admin'), paymentController.getPaymentReports);

export default router; 