import { PaymentMethod } from 'mercadopago';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaymentCreateRequest } from 'mercadopago/dist/clients/payment/create/types';

interface WebhookEvent {
    // Revisar los valores de llegada
}

export interface MercadoPagoServiceInterface {
    createOrder(paymentData: PaymentCreateRequest): Promise<PaymentResponse>;
    webhookReceive(webhookEvent: WebhookEvent): Promise<void>;
    getPaymentMethod(): Promise<PaymentMethod>;
}
