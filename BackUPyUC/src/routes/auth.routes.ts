import { Router } from 'express';
import { AuthController } from '../api/controllers/auth.controller';
import { AuthService } from '../api/services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);

export default router; 