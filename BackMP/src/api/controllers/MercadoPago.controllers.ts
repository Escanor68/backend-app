import { Request, Response } from 'express';
import { MercadoPagoControllerInterface } from '../interfaces/MercadoPago.controller.interface';
import { mercadoPagoService } from '../../core/services';
import validatePaymentCreateRequest from './validation/userField/paymentCreate';

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
        } catch (error: any) {
            console.error('Error processing webhook:', error);
            res.status(500).send({
                status: 500,
                message: error?.message || 'Internal server error',
            });
        }
    }

    /**
     * Crea un nuevo pago utilizando el servicio de Mercado Pago.
     * @param req - La solicitud HTTP.
     * @param res - La respuesta HTTP.
     */
    async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const validationResult = await validatePaymentCreateRequest(
                req.body,
            );
            if (validationResult.error) {
                console.warn('Validation failed:', validationResult.error);
                res.status(400).send({
                    status: 400,
                    message: 'Invalid payment data',
                    details: validationResult.error,
                });
                return;
            }

            const paymentResponse = await mercadoPagoService.createOrder(
                req.body,
            );
            res.status(200).send({
                status: 200,
                response: paymentResponse,
            });
        } catch (error: any) {
            console.error('Error creating payment order:', error);
            res.status(500).send({
                status: 500,
                message: error?.message || 'Internal server error',
            });
        }
    }

    /**
     * Obtiene los métodos de pago disponibles en Mercado Pago.
     * @param req - La solicitud HTTP.
     * @param res - La respuesta HTTP.
     */
    async getPaymentMethod(req: Request, res: Response): Promise<void> {
        try {
            const paymentMethods = await mercadoPagoService.getPaymentMethod();
            res.status(200).send({
                status: 200,
                response: paymentMethods,
            });
        } catch (error: any) {
            console.error('Error fetching payment methods:', error);
            res.status(500).send({
                status: 500,
                message: error?.message || 'Internal server error',
            });
        }
    }
}
