import { MercadoPagoConfig, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import { MercadoPagoClientInterface } from '../interfaces/MercadoPago.client.interface';

dotenv.config();

export class MercadoPagoClient implements MercadoPagoClientInterface {
    public client: any;
    constructor() {
        const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!token) {
            throw new Error('Mercado Pago access token is missing');
        }

        this.client = new MercadoPagoConfig({ accessToken: token });
    }

    async createPayment(paymentData: any): Promise<any> {
        try {
            const payment = new Payment(this.client);
            return await payment.create(paymentData);
        } catch (error) {
            throw new Error('Failed to create payment: ' + error);
        }
    }
}
