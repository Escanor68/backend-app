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
            }
        } catch (error) {
            throw new Error('Failed to event WebHook: ' + error);
        }
    }
    async createPayment(paymentData: any): Promise<any> {
        try {
            return await this.mercadoPagoClient.createPayment(paymentData);
        } catch (error) {
            throw new Error('Failed to create payment: ' + error);
        }
    }
}
