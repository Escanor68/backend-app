import { Request, Response } from 'express';
import { UserPlayerControllerInterface } from '../interface/UserPlayer.controller.interface';
import { userPlayerService } from '../../core/service/';
import validateLogin from './validation/userPlayer/login';
import validateNewUserPlayer from './validation/userPlayer/insertData';
import validateUpdateUserPlayer from './validation/userPlayer/update';
import validateInactiveUserPlayer from './validation/userPlayer/inactive';
import validateSendTokenUserPlayer from './validation/userPlayer/sendtoken';
import validateRecibeTokenUserPlayer from './validation/userPlayer/recibeToken';

export class UserPlayerController implements UserPlayerControllerInterface {
    async login(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateLogin(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const { email, password } = req.body;
            const user = await userPlayerService.authenticate(email, password);

            if (!user) {
                res.status(404).send({
                    message: 'Usuario no encontrado por mail: ' + email,
                });
                return;
            }

            res.status(200).send({ response: user });
        } catch (error) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error,
            });
            return;
        }
    }

    async newUserPlayer(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateNewUserPlayer(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            await userPlayerService.insertData(req.body);

            res.status(200).send({ response: 'Usuario creado' });
        } catch (error) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error,
            });
            return;
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateUpdateUserPlayer(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const user = await userPlayerService.update(req.body.id, req.body);

            if (!user) {
                res.status(404).send({
                    message: 'Usuario no encontrado',
                });
                return;
            }

            res.status(200).send({ message: 'User update' });
        } catch (error) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error,
            });
            return;
        }
    }

    async inactivate(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateInactiveUserPlayer(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const user = await userPlayerService.inactivate(req.body);
            if (!user) {
                res.status(404).send({
                    message: 'Usuario no encontrado',
                });
                return;
            }

            res.status(200).send({ response: 'Usuario inactivado' });
        } catch (error) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error,
            });
            return;
        }
    }

    async sendToken(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateSendTokenUserPlayer(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const user = await userPlayerService.sendTokenReset(req.body.email);
            if (!user) {
                res.status(404).send({
                    message: 'Usuario no encontrado',
                });
                return;
            }

            res.status(200).send({ response: 'Envio del Token' });
        } catch (error) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error,
            });
            return;
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateRecibeTokenUserPlayer(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const { token } = req.params;
            const { newPassword } = req.body;
            const user = await userPlayerService.resetPassword(
                token,
                newPassword,
            );
            if (!user) {
                res.status(404).send({
                    message: 'Usuario no encontrado',
                });
                return;
            }

            res.status(200).send({ response: 'Reset Password' });
        } catch (error) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error,
            });
            return;
        }
    }
}
