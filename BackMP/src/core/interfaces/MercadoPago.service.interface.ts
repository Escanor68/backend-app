import { PaymentMethod } from 'mercadopago';
import { PaymentCreateData } from '../../infrastructure/interfaces/PaymentDataCard.interface';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

interface WebhookEvent {
    // Revisar los valores de llegada
}

export interface MercadoPagoServiceInterface {
    createOrder(paymentData: PaymentCreateData): Promise<PaymentResponse>;
    webhookReceive(webhookEvent: WebhookEvent): Promise<void>;
    getPaymentMethod(): Promise<PaymentMethod>;
}
