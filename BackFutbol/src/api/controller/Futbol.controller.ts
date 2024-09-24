import { NextFunction, Request, Response } from 'express';
import { FutbolControllerInterface } from '../interface/Futbol.controller.interface';
import { futbolService } from '../../core/service';
import validateCrearCancha from './validations/cancha/crearCancha';
import validateTraerCanchas from './validations/cancha/traerCanchas';
import validateReservarCanchas from './validations/cancha/reservarCancha';

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

    async traerCanchas(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateTraerCanchas(req.body);
            if (validateBody.error) {
                res.status(404).send(validateBody);
                return;
            }

            const { userField } = req.body;

            const canchas = await futbolService.traerCanchas(userField);

            res.status(200).send(canchas);
        } catch (error: any) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error?.message,
            });
            return;
        }
    }

    async reservarCanchas(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateReservarCanchas(req.body);
            if (validateBody.error) {
                res.status(404).send(validateBody);
                return;
            }

            const {
                owner,
                fieldName,
                schedule,
                who_reserved_id,
                who_reserved_name,
            } = req.body;

            await futbolService.reservarCancha(
                owner,
                fieldName,
                schedule,
                who_reserved_id,
                who_reserved_name,
            );

            res.status(200).send({ response: 'Canchas reservada' });
        } catch (error: any) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error?.message,
            });
            return;
        }
    }
}
