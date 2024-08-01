import { Request, Response } from 'express';
import { UserPlayerControllerInterface } from '../interface/UserPlayer.controller.interface';
import { userPlayerService } from '../../core/service/';

export class UserPlayerController implements UserPlayerControllerInterface {
    public async getName(req: Request, res: Response): Promise<void> {
        try {
            const userName = await userPlayerService.search(req.body.name);
            if (!userName) {
                res.status(404).send({
                    message: `Usuario no encontrado con el nombre ${req.body.name}`,
                });
            }

            res.status(200).send({
                response: userName,
            });
        } catch (error) {
            res.status(500).send({
                message: 'Error interno del servidor',
            });
        }
    }
}
