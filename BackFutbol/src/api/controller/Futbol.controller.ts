import { Request, Response } from 'express';
import { FutbolControllerInterface } from '../interface/Futbol.controller.interface';
import { futbolService } from '../../core/service';
import validateCrearCancha from './validations/cancha/crearCancha';

export class FutbolController implements FutbolControllerInterface {
    async crearTurnos(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateCrearCancha(req.body);
            if (validateBody.error) {
                res.status(404).send(validateBody);
                return;
            }

            const {
                userField,
                fieldName,
                availableFrom,
                availableUntil,
                price,
            } = req.body;

            await futbolService.crearCanchas(
                userField,
                fieldName,
                availableFrom,
                availableUntil,
                price,
            );

            res.status(200).send({ response: 'Canchas creadas' });
        } catch (error: any) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error?.message,
            });
            return;
        }
    }
}
