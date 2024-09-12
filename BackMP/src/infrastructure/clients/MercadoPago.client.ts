import { MercadoPagoConfig, Payment, PaymentMethod } from 'mercadopago';
import { MercadoPagoClientInterface } from '../interfaces/MercadoPago.client.interface';
import { axiosMercadoPagoApi } from '../setting/axios';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaymentCreateRequest } from 'mercadopago/dist/clients/payment/create/types';
import dotenv from 'dotenv';

dotenv.config();

export class MercadoPagoClient implements MercadoPagoClientInterface {
    private client: MercadoPagoConfig;

    constructor() {
        const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!token) {
            throw new Error('Mercado Pago access token is missing');
        }

        // Configuración del cliente de Mercado Pago
        this.client = new MercadoPagoConfig({
            accessToken: token,
        });
    }

    /**
     * Crea una preferencia de pago en Mercado Pago
     * @param paymentData - Los datos necesarios para crear la preferencia de pago
     * @returns La respuesta de la API de Mercado Pago
     */
    async createOrder(
        paymentData: PaymentCreateRequest,
    ): Promise<PaymentResponse> {
        try {
            // Inicializa el objeto Payment
            const payment = new Payment(this.client);

            // Crea la preferencia de pago
            const response = await payment.create({ body: paymentData });

            // Manejo adicional de la respuesta si es necesario
            return response;
        } catch (error: any) {
            console.error(
                'Failed to create payment order:',
                error.response?.data || error.message,
            );
            throw new Error(
                'Failed to create payment order: ' +
                    (error.response?.data || error.message),
            );
        }
    }

    /**
     * Obtiene los métodos de pago disponibles en Mercado Pago.
     * @returns Una promesa que se resuelve con una lista de métodos de pago.
     */
    async getPaymentMethod(): Promise<PaymentMethod[]> {
        try {
            const response = await axiosMercadoPagoApi.get(
                '/v1/payment_methods',
            );
            return response.data;
        } catch (error: any) {
            console.error(
                'Failed to get payment methods:',
                error.response?.data || error.message,
            );
            throw new Error(
                'Failed to get payment methods: ' +
                    (error.response?.data || error.message),
            );
        }
    }
}
