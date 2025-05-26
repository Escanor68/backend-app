import { Router } from 'express';
import { AuthController } from '../api/controllers/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Rutas protegidas
router.post('/refresh-token', authMiddleware, AuthController.refreshToken);

export default router; 