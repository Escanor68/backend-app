import { NextFunction, Request, Response } from 'express';

export interface MercadoPagoControllerInterface {
    createOrder(req: Request, res: Response, next: NextFunction): Promise<any>;
    webhookReceive(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;
    getPaymentMethod(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;
}
