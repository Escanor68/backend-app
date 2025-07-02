import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Rutas protegidas
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.post(
    '/logout-all-sessions',
    authMiddleware,
    authController.logoutAllSessions.bind(authController)
);
router.get('/validate-token', authMiddleware, authController.validateToken.bind(authController));
router.post('/change-password', authMiddleware, authController.changePassword.bind(authController));
router.get('/me', authMiddleware, authController.getProfile.bind(authController));

export default router;
