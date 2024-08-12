import { Request, Response } from 'express';
import { MercadoPagoControllerInterface } from '../interfaces/MercadoPago.controller.interface';
import { mercadoPagoService } from '../../core/services';

class MercadoPagoController implements MercadoPagoControllerInterface {
    async webhookReceive(req: Request, res: Response): Promise<void> {
        try {
            const body = {
                status: 200,
                response: await mercadoPagoService.webhookReceive(req.body),
            };

            res.status(200).send(body);
        } catch (error) {
            res.status(200).send({
                status: 500,
                message: error || 'internal server error',
            });
        }
    }

    async createPayment(req: Request, res: Response): Promise<void> {
        try {
            const body = {
                status: 200,
                response: await mercadoPagoService.createPayment(req.body),
            };

            res.status(200).send(body);
        } catch (error) {
            res.status(200).send({
                status: 500,
                message: error || 'internal server error',
            });
        }
    }
}

export { MercadoPagoController };
