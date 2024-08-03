import { Router } from 'express';
import { userPlayerController } from '../api/controller';

const router = Router({ mergeParams: true });

router.post(`/api/v1/login`, userPlayerController.login);
router.post(`/api/v1/create`, userPlayerController.newUserPlayer);
router.put(`/api/v1/update`, userPlayerController.update);
router.put(`/api/v1/inactivate`, userPlayerController.inactivate);
router.post(`/api/v1/request-password-reset`, userPlayerController.sendToken);
router.post(
    `/api/v1/reset-password/:token`,
    userPlayerController.resetPassword,
);

export default router;
