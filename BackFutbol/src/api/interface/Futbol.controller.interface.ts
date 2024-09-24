import { NextFunction, Request, Response } from 'express';

export interface FutbolControllerInterface {
    crearTurnos(req: Request, res: Response, next: NextFunction): Promise<void>;
    traerCanchas(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;
    reservarCanchas(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void>;
}
