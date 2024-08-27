import { MercadoPagoConfig, Payment } from 'mercadopago';
import { MercadoPagoClientInterface } from '../interfaces/MercadoPago.client.interface';
import { axiosMercadoPagoApi } from '../setting/axios';
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
    async createOrder(paymentData: any): Promise<any> {
        try {
            // Inicializa el objeto Payment
            const payment = new Payment(this.client);

            // Crea la preferencia de pago
            return await payment.create({ body: paymentData });
        } catch (error) {
            throw new Error('Failed to create payment order: ' + error);
        }
    }

    /**
     * Recibe un webhook de Mercado Pago y procesa el evento
     * @param payment - Los datos del webhook recibidos
     * @returns Los datos de la transacción si el tipo de webhook es "payment"
     */
    async receiveWebhook(payment: any): Promise<any> {
        try {
            if (payment.type === 'payment') {
                const paymentInstance = new Payment(this.client);
                const data = await paymentInstance.get({
                    id: payment['data.id'],
                });
                return data;
            }
            return null;
        } catch (error) {
            throw new Error('Failed to process webhook: ' + error);
        }
    }

    /**
     * Obtiene los métodos de pago disponibles en Mercado Pago.
     * @returns Una promesa que se resuelve con una lista de métodos de pago.
     */
    async getPaymentMethod(): Promise<Array<object>> {
        try {
            const response = await axiosMercadoPagoApi.get(
                '/v1/payment_methods',
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to get payment methods: ' + error);
        }
    }
}
