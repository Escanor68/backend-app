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

router.get(
    `/api/v1/mercadoPago/getPaymentMethod`,
    mercadoPagoController.getPaymentMethod,
);

export default router;
