import { ApiFutbolClientInterface } from '../interfaces/ApiFutbol.client.interface';
import { axiosApiFutbol } from '../setting/axios';

export class ApiFutbolClient implements ApiFutbolClientInterface {
    /**
     * Envía información de pago al microservicio de reservas.
     *
     * @param paymentData - Los datos del pago que se enviarán al microservicio.
     * @returns Una promesa que se resuelve cuando la información se envía correctamente.
     * @throws Un error si la solicitud falla.
     */
    public async sendPaymentInfo(paymentData: any): Promise<void> {
        try {
            await axiosApiFutbol.post('/api/v1/appfutbol/receive/payment', {
                paymentData,
            });
        } catch (error) {
            throw new Error(
                'Failed to send payment information to the reservation microservice: ' +
                    error,
            );
        }
    }
}
