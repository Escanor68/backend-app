import { MercadoPagoClientInterface } from '../../infrastructure/interfaces/MercadoPago.client.interface';
import { MercadoPagoServiceInterface } from '../interfaces/MercadoPago.service.interface';
import { ApiFutbolClientInterface } from '../../infrastructure/interfaces/ApiFutbol.client.interface';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';
import { PaymentMethod } from 'mercadopago';
import { PaymentCreateRequest } from 'mercadopago/dist/clients/payment/create/types';
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
            console.log(
                `Received webhook event: ${JSON.stringify(webhookEvent)}`,
            );

            const eventType = webhookEvent.type.split('.')[0];
            if (eventType === 'payment') {
                await this.updateRecordAndSendInfo(webhookEvent);
            } else {
                console.warn(`Unhandled webhook event type: ${eventType}`);
                throw new Error('Unhandled event type');
            }
        } catch (error) {
            console.error('Failed to handle WebHook event:', error);
            throw new Error('Failed to handle WebHook event: ' + error);
        }
    }

    /**
     * Crea un nuevo pago utilizando el cliente de Mercado Pago.
     * @param paymentData - Los datos necesarios para crear el pago.
     * @returns La respuesta de la creación del pago.
     */
    async createOrder(
        paymentData: PaymentCreateRequest,
    ): Promise<PaymentResponse> {
        try {
            console.log('Creating payment order with data:', paymentData);
            const paymentResponse =
                await this.mercadoPagoClient.createOrder(paymentData);
            console.log('Payment created successfully:', paymentResponse);
            return paymentResponse;
        } catch (error) {
            console.error('Failed to create payment:', error);
            throw new Error('Failed to create payment: ' + error);
        }
    }

    /**
     * Actualiza un registro en la base de datos y envía la información actualizada.
     * @param updatedData - Los datos que se han actualizado.
     */
    private async updateRecordAndSendInfo(updatedData: any): Promise<void> {
        try {
            console.log('Updating record with data:', updatedData);

            // Aquí iría la lógica para actualizar la base de datos
            // Por ejemplo, hacer un update en la base de datos con los datos recibidos

            // Envía la información actualizada utilizando el cliente ApiFutbolClient
            await this.apiFutbolClient.sendPaymentInfo(updatedData);
            console.log('Information sent to ApiFutbolClient successfully');
        } catch (error) {
            console.error('Failed to update record and send info:', error);
            throw new Error('Failed to update record and send info: ' + error);
        }
    }

    /**
     * Obtiene los métodos de pago disponibles en Mercado Pago.
     * @returns Una lista de objetos que representan los métodos de pago disponibles.
     */
    async getPaymentMethod(): Promise<PaymentMethod[]> {
        try {
            console.log('Fetching payment methods from MercadoPago');
            const paymentMethods =
                await this.mercadoPagoClient.getPaymentMethod();
            console.log(
                'Payment methods fetched successfully:',
                paymentMethods,
            );
            return paymentMethods;
        } catch (error) {
            console.error('Failed to get payment methods:', error);
            throw new Error('Failed to get payment methods: ' + error);
        }
    }
}
