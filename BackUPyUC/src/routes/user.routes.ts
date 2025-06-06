import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { PasswordResetController } from '../controllers/password-reset.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';
import { ACTIONS, RESOURCES } from '../core/constants';

const router = Router();
const userController = new UserController();
const passwordResetController = new PasswordResetController();

// Rutas públicas
router.post('/register', userController.register.bind(userController));
router.post(
    '/request-password-reset',
    auditMiddleware(ACTIONS.RESET_PASSWORD, RESOURCES.USER),
    passwordResetController.requestPasswordReset.bind(passwordResetController)
);
router.post(
    '/reset-password',
    auditMiddleware(ACTIONS.RESET_PASSWORD, RESOURCES.USER),
    passwordResetController.resetPassword.bind(passwordResetController)
);

// Rutas protegidas
router.get('/profile', authMiddleware, userController.getProfile.bind(userController));
router.put('/profile', authMiddleware, userController.updateProfile.bind(userController));
router.put('/password', authMiddleware, userController.updatePassword.bind(userController));

// Rutas de administrador
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['admin']),
    userController.getAllUsers.bind(userController)
);
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    userController.getUserById.bind(userController)
);
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    userController.updateUser.bind(userController)
);
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin']),
    userController.deleteUser.bind(userController)
);
router.post(
    '/:id/block',
    authMiddleware,
    roleMiddleware(['admin']),
    userController.blockUser.bind(userController)
);
router.post(
    '/:id/unblock',
    authMiddleware,
    roleMiddleware(['admin']),
    userController.unblockUser.bind(userController)
);
router.put(
    '/:id/roles',
    authMiddleware,
    roleMiddleware(['admin']),
    userController.updateRoles.bind(userController)
);

// Rutas de campos favoritos
router.post('/favorites', authMiddleware, userController.addFavoriteField.bind(userController));
router.delete(
    '/favorites/:fieldId',
    authMiddleware,
    userController.removeFavoriteField.bind(userController)
);
router.get('/favorites', authMiddleware, userController.getFavoriteFields.bind(userController));

// Rutas de notificaciones
router.get('/notifications', authMiddleware, userController.getNotifications.bind(userController));
router.put(
    '/notifications/:id/read',
    authMiddleware,
    userController.markNotificationAsRead.bind(userController)
);
router.delete(
    '/notifications/:id',
    authMiddleware,
    userController.deleteNotification.bind(userController)
);

export default router;
