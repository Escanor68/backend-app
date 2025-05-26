import { Router } from 'express';
import { PaymentController } from '../api/controllers/payment.controller';
import { authMiddleware, hasRole } from '../middleware/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación excepto el webhook
router.post('/webhook', PaymentController.handleWebhook);

// Rutas autenticadas
router.use(authMiddleware);

// Rutas para usuarios autenticados
router.post('/', PaymentController.createPayment);
router.get('/user', PaymentController.getUserPayments);
router.get('/:id', PaymentController.getPaymentStatus);

// Rutas que requieren rol de admin
router.post('/:id/refund', hasRole(['admin']), PaymentController.refundPayment);

export default router; 