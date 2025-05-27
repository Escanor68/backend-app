import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { validatePaymentRequest } from '../middleware/validators/payment.validator';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// Ruta para crear un nuevo pago - requiere autenticación
router.post('/preference', 
    authenticate(),
    validatePaymentRequest,
    paymentController.createPreference
);

// Ruta para obtener el estado de un pago - requiere autenticación
router.get('/:id/status',
    authenticate(),
    paymentController.getPaymentStatus
);

// Ruta para obtener todos los pagos - solo admin
router.get('/all',
    requireRole('admin'),
    paymentController.getAllPayments
);

// Webhook para notificaciones de MercadoPago - sin autenticación ya que viene de MP
router.post('/webhook', paymentController.handleWebhook);

export default router; 