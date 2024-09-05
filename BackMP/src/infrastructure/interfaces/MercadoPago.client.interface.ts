import { PaymentMethod } from 'mercadopago';
import { PaymentDataInterface } from './PaymentData.interface';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

export interface MercadoPagoClientInterface {
    createOrder(paymentData: PaymentDataInterface): Promise<PaymentResponse>;
    getPaymentMethod(): Promise<PaymentMethod>;
}
