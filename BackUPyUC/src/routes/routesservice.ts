import { Router } from 'express';
import { userPlayerController } from '../api/controller';

const router = Router({ mergeParams: true });

router.post(`/api/v1/userPlayer/login`, userPlayerController.login);
router.post(`/api/v1/userPlayer/create`, userPlayerController.newUserPlayer);
router.put(`/api/v1/userPlayer/update`, userPlayerController.update);
router.put(`/api/v1/userPlayer/inactivate`, userPlayerController.inactivate);
router.post(`/api/v1/userPlayer/request-password-reset`, userPlayerController.sendToken);
router.post(
    `/api/v1/userPlayer/reset-password/:token`,
    userPlayerController.resetPassword,
);

export default router;
