import { PaymentMethod } from 'mercadopago';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaymentCreateRequest } from 'mercadopago/dist/clients/payment/create/types';

export interface MercadoPagoClientInterface {
    createOrder(paymentData: PaymentCreateRequest): Promise<PaymentResponse>;
    getPaymentMethod(): Promise<PaymentMethod>;
}
