import { Router } from 'express';
import { authMiddleware, hasRole } from '../middleware/authMiddleware';
import { UserController } from '../api/controllers/user.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para todos los usuarios autenticados
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Rutas solo para administradores
router.get('/users', hasRole(['admin']), UserController.getAllUsers);
router.post('/users', hasRole(['admin']), UserController.createUser);
router.put('/users/:id', hasRole(['admin']), UserController.updateUser);
router.delete('/users/:id', hasRole(['admin']), UserController.deleteUser);

export default router; 