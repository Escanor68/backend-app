import { ApiFutbolClientInterface } from '../interfaces/ApiFutbol.client.interface';
import { axiosApiFutbol } from '../setting/axios';
import dotenv from 'dotenv';

dotenv.config();

export class ApiFutbolClient implements ApiFutbolClient {
    public async name(paymentData: any) {
        try {
            await axiosApiFutbol.post('/api/v1/appfutbol/receive/payment', {
                paymentData,
            });
        } catch (error) {
            throw new Error('Failed to send the payment: ' + error);
        }
    }
}
