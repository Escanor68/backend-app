import { PaymentMethod } from 'mercadopago';
import { PaymentCreateData } from './PaymentDataCard.interface';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

export interface MercadoPagoClientInterface {
    createOrder(paymentData: PaymentCreateData): Promise<PaymentResponse>;
    getPaymentMethod(): Promise<PaymentMethod>;
}
