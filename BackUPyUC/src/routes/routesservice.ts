import { Router } from 'express';
import { userPlayerController } from '../api/controller';
import { userFieldController } from '../api/controller';

const router = Router({ mergeParams: true });

router.post(`/api/v1/userPlayer/login`, userPlayerController.login);
router.post(`/api/v1/userPlayer/create`, userPlayerController.newUserPlayer);
router.put(`/api/v1/userPlayer/update`, userPlayerController.update);
router.put(`/api/v1/userPlayer/inactivate`, userPlayerController.inactivate);
router.post(`/api/v1/userPlayer/request-password-reset`, userPlayerController.sendToken);
router.put(`/api/v1/userPlayer/reset-password/:token`, userPlayerController.resetPassword);

router.post(`/api/v1/userField/login`, userFieldController.login);
router.post(`/api/v1/userField/create`, userFieldController.newUserField);
router.put(`/api/v1/userField/update`, userFieldController.update);
router.put(`/api/v1/userField/inactivate`, userFieldController.inactivate);
router.post(`/api/v1/userField/request-password-reset`, userFieldController.sendToken);
router.put(`/api/v1/userField/reset-password/:token`, userFieldController.resetPassword);

export default router;
