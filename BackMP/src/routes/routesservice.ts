import { Router } from 'express';
import { mercadoPagoController } from '../api/controllers';
const router = Router({ mergeParams: true });

router.post(
    `/api/v1/mercadoPago/payment/created`,
    mercadoPagoController.createPayment,
);

router.post(
    `/api/v1/mercadoPago/webhook/receives`,
    mercadoPagoController.webhookReceive,
);

export default router;
