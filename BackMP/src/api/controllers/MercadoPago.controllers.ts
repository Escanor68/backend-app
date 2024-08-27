import { Request, Response } from 'express';
import { MercadoPagoControllerInterface } from '../interfaces/MercadoPago.controller.interface';
import { mercadoPagoService } from '../../core/services';

export class MercadoPagoController implements MercadoPagoControllerInterface {
    /**
     * Maneja la recepción de un webhook y lo procesa a través del servicio de Mercado Pago.
     * @param req - La solicitud HTTP.
     * @param res - La respuesta HTTP.
     */
    async webhookReceive(req: Request, res: Response): Promise<void> {
        try {
            await mercadoPagoService.webhookReceive(req.body);
            res.status(200).send({
                status: 200,
                message: 'Webhook processed successfully',
            });
        } catch (error) {
            res.status(500).send({
                status: 500,
                message: error || 'Internal server error',
            });
        }
    }

    /**
     * Crea un nuevo pago utilizando el servicio de Mercado Pago.
     * @param req - La solicitud HTTP.
     * @param res - La respuesta HTTP.
     */
    async createPayment(req: Request, res: Response): Promise<void> {
        try {
            const paymentResponse = await mercadoPagoService.createPayment(
                req.body,
            );
            res.status(200).send({
                response: paymentResponse,
            });
        } catch (error) {
            res.status(500).send({
                message: error || 'Internal server error',
            });
        }
    }

    /**
     * Busca las formas de pago pago utilizando el servicio de Mercado Pago.
     * @param req - La solicitud HTTP.
     * @param res - La respuesta HTTP.
     */
    async getPaymentMethod(req: Request, res: Response): Promise<void> {
        try {
            const paymentResponse = await mercadoPagoService.getPaymentMethod();
            res.status(200).send({
                response: paymentResponse,
            });
        } catch (error) {
            res.status(500).send({
                message: error || 'Internal server error',
            });
        }
    }
}
