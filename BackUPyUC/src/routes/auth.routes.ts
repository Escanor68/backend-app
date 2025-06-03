import { Router } from 'express';
import { AuthController } from '../api/controllers/auth.controller';
import { AuthService } from '../api/services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);

export default router;
