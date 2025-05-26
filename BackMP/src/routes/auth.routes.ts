import { Router } from 'express';
import { AuthController } from '../api/controllers/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Rutas protegidas
router.use(authMiddleware);
router.post('/change-password', AuthController.changePassword);

export default router; 