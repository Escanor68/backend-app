import { Request, Response } from 'express';
import { UserFieldControllerInterface } from '../interface/UserField.controller.interface';
import { userFieldService } from '../../core/service/';
import validateLogin from './validation/userField/login';
import validateNewUserField from './validation/userField/insertData';
import validateUpdateUserField from './validation/userField/update';
import validateInactiveUserField from './validation/userField/inactive';

export class UserFieldController implements UserFieldControllerInterface {
    async login(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateLogin(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const { email, password } = req.body;
            const user = await userFieldService.authenticate(email, password);

            if (!user) {
                res.status(404).send({
                    message: 'Usuario no encontrado por ID: ' + email,
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

    async newUserField(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateNewUserField(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const {
                field_name,
                email,
                password,
                phoneNumber,
                tax_id,
                address,
            } = req.body;
            await userFieldService.insertData(
                field_name,
                email,
                password,
                phoneNumber,
                tax_id,
                address,
            );

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
            const validateBody = await validateUpdateUserField(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const user = await userFieldService.update(req.body.id, req.body);

            if (!user) {
                res.status(404).send({ message: 'Usuario no encontrado' });
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

    async inactivate(req: Request, res: Response): Promise<void> {
        try {
            const validateBody = await validateInactiveUserField(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const user = await userFieldService.inactivate(req.body);
            if (!user) {
                res.status(404).send({ message: 'Usuario no encontrado' });
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
            const validateBody = await validateInactiveUserField(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const user = await userFieldService.sendTokenReset(req.body);
            if (!user) {
                res.status(404).send({ message: 'Usuario no encontrado' });
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
            const validateBody = await validateInactiveUserField(req.body);
            if (validateBody.error) {
                res.status(400).send(validateBody);
                return;
            }

            const { token } = req.params;
            const { newPassword } = req.body;
            const user = await userFieldService.resetPassword(
                token,
                newPassword,
            );
            if (!user) {
                res.status(404).send({ message: 'Usuario no encontrado' });
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

    async getNearbyFields(req: Request, res: Response): Promise<void> {
        try {
            const { latitude, longitude } = req.body;
            const userNearby = await userFieldService.getNearbyFields(
                latitude,
                longitude,
            );

            res.status(200).send(userNearby);
        } catch (error: any) {
            res.status(500).send({
                message: 'Error interno del servidor: ' + error?.message,
            });
            return;
        }
    }
}
