import { Router } from 'express';
import { AuthController } from '../api/controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));

// Rutas protegidas
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/validate-token', authMiddleware, authController.validateToken.bind(authController));
router.post('/change-password', authMiddleware, authController.changePassword.bind(authController));

export default router;
