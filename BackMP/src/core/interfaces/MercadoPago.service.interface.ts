import { PaymentMethod } from 'mercadopago';
import { PaymentDataInterface } from '../../infrastructure/interfaces/PaymentData.interface';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

interface WebhookEvent {
    // Revisar los valores de llegada
}

export interface MercadoPagoServiceInterface {
    createPayment(paymentData: PaymentDataInterface): Promise<PaymentResponse>;
    webhookReceive(webhookEvent: WebhookEvent): Promise<void>;
    updateRecordAndSendInfo(recordId: string, updatedData: any): Promise<void>;
    getPaymentMethod(): Promise<PaymentMethod>;
}
