import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

export default router; 