import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Base URL: http://localhost:3002
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router; 