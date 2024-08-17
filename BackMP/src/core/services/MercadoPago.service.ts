import { MercadoPagoClientInterface } from '../../infrastructure/interfaces/MercadoPago.client.interface';
import { MercadoPagoServiceInterface } from '../interfaces/MercadoPago.service.interface';
import dotenv from 'dotenv';

dotenv.config();

export class MercadoPagoService implements MercadoPagoServiceInterface {
    mercadoPagoClient: MercadoPagoClientInterface;

    constructor(mercadoPagoClient: MercadoPagoClientInterface) {
        this.mercadoPagoClient = mercadoPagoClient;
    }

    async webhookReceive(webhookEvent: any): Promise<void> {
        try {
            switch (webhookEvent.type.split('.')[0]) {
                case 'payment':
                    await this.updateRecordAndSendInfo.call(this, webhookEvent);
                    break;
                default:
                    throw new Error('Unhandled event type');
            }
        } catch (error) {
            throw new Error('Failed to handle WebHook event: ' + error);
        }
    }

    async createPayment(paymentData: any): Promise<any> {
        try {
            return await this.mercadoPagoClient.createPayment(paymentData);
        } catch (error) {
            throw new Error('Failed to create payment: ' + error);
        }
    }

    // agregar el registro a la base de datos IMPORTANTE no listo
    async updateRecordAndSendInfo(updatedData: any): Promise<void> {
        try {
            this.sendInfo(updatedData);
        } catch (error) {
            throw new Error('Failed to update record and send info: ' + error);
        }
    }

    // enviar la información actualizada
    private sendInfo(data: any): void {
        // Lógica para enviar la información (ejemplo: a un servicio externo o notificación)
        console.log('Sending info:', data);
    }
}
