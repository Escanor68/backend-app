import { MercadoPagoClientInterface } from '../../infrastructure/interfaces/MercadoPago.client.interface';
import { MercadoPagoServiceInterface } from '../interfaces/MercadoPago.service.interface';
import { ApiFutbolClientInterface } from '../../infrastructure/interfaces/ApiFutbol.client.interface';
import dotenv from 'dotenv';

dotenv.config();

export class MercadoPagoService implements MercadoPagoServiceInterface {
    private mercadoPagoClient: MercadoPagoClientInterface;
    private apiFutbolClient: ApiFutbolClientInterface;

    constructor(
        mercadoPagoClient: MercadoPagoClientInterface,
        apiFutbolClient: ApiFutbolClientInterface,
    ) {
        this.mercadoPagoClient = mercadoPagoClient;
        this.apiFutbolClient = apiFutbolClient;
    }

    /**
     * Maneja la recepción de un evento webhook.
     * @param webhookEvent - El evento webhook recibido.
     */
    async webhookReceive(webhookEvent: any): Promise<void> {
        try {
            switch (webhookEvent.type.split('.')[0]) {
                case 'payment':
                    await this.updateRecordAndSendInfo(webhookEvent);
                    break;
                default:
                    throw new Error('Unhandled event type');
            }
        } catch (error) {
            throw new Error('Failed to handle WebHook event: ' + error);
        }
    }

    /**
     * Crea un nuevo pago utilizando el cliente de Mercado Pago.
     * @param paymentData - Los datos necesarios para crear el pago.
     * @returns La respuesta de la creación del pago.
     */
    async createPayment(paymentData: any): Promise<any> {
        try {
            return await this.mercadoPagoClient.createOrder(paymentData);
        } catch (error) {
            throw new Error('Failed to create payment: ' + error);
        }
    }

    /**
     * Actualiza un registro en la base de datos y envía la información actualizada.
     * @param updatedData - Los datos que se han actualizado.
     */
    async updateRecordAndSendInfo(updatedData: any): Promise<void> {
        try {
            // Aquí iría la lógica para actualizar la base de datos
            console.log('Updating record with data:', updatedData);

            // Envía la información actualizada utilizando el cliente ApiFutbolClient
            await this.apiFutbolClient.sendPaymentInfo(updatedData);
        } catch (error) {
            throw new Error('Failed to update record and send info: ' + error);
        }
    }

    /**
     * Retrieves the payment methods using the MercadoPago client.
     * @returns An array of objects representing the payment methods.
     * @throws {Error} If there is a failure to retrieve the payment methods.
     */
    async getPaymentMethod(): Promise<Array<object>> {
        try {
            return await this.mercadoPagoClient.getPaymentMethod();
        } catch (error) {
            throw new Error('Failed to get payment methods: ' + error);
        }
    }
}
