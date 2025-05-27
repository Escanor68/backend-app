import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateProfile, validateFavoriteField } from '../middleware/validators/user.validator';

const router = Router();
const userController = new UserController();

// Rutas protegidas de usuario
router.use(authenticate());

// Campos favoritos
router.post('/me/favorite-fields', validateFavoriteField, userController.addFavoriteField);
router.delete('/me/favorite-fields/:fieldId', userController.removeFavoriteField);
router.get('/me/favorite-fields', userController.getFavoriteFields);

// Notificaciones
router.get('/me/notifications', userController.getNotifications);
router.patch('/me/notifications/:id/read', userController.markNotificationAsRead);
router.delete('/me/notifications/:id', userController.deleteNotification);

// Perfil
router.put('/me/profile', validateProfile, userController.updateProfile);

// Rutas de administrador
router.get('/admin/users', requireRole('admin'), userController.getAllUsers);
router.post('/admin/users/:id/block', requireRole('admin'), userController.blockUser);
router.post('/admin/users/:id/role', requireRole('admin'), userController.updateUserRole);

export default router; 