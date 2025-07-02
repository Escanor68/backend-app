import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role.middleware';
import { UserRole } from '../types/user.types';

const router = Router();
const userController = new UserController();

// Rutas públicas
router.post('/register', (req: Request, res: Response) => userController.register(req, res));
router.post('/login', (req: Request, res: Response) => userController.login(req, res));
router.post('/forgot-password', (req: Request, res: Response) =>
    userController.forgotPassword(req, res)
);
router.post('/reset-password', (req: Request, res: Response) =>
    userController.resetPassword(req, res)
);

// Rutas protegidas
router.get('/profile', authMiddleware, (req: Request, res: Response) =>
    userController.getProfile(req as any, res)
);
router.put('/profile', authMiddleware, (req: Request, res: Response) =>
    userController.updateProfile(req as any, res)
);
router.post('/change-password', authMiddleware, (req: Request, res: Response) =>
    userController.changePassword(req as any, res)
);

// Rutas de campos favoritos
router.get('/favorite-fields', authMiddleware, (req: Request, res: Response) =>
    userController.getFavoriteFields(req as any, res)
);
router.post('/favorite-fields', authMiddleware, (req: Request, res: Response) =>
    userController.addFavoriteField(req as any, res)
);
router.delete('/favorite-fields/:fieldId', authMiddleware, (req: Request, res: Response) =>
    userController.removeFavoriteField(req as any, res)
);

// Rutas de notificaciones
router.get('/notifications', authMiddleware, (req: Request, res: Response) =>
    userController.getNotifications(req as any, res)
);
router.put('/notifications/:id/read', authMiddleware, (req: Request, res: Response) =>
    userController.markNotificationAsRead(req as any, res)
);

// Rutas de administración (solo para administradores)
router.get(
    '/admin/users',
    authMiddleware,
    roleMiddleware([UserRole.ADMIN]),
    (req: Request, res: Response) => userController.getAllUsers(req as any, res)
);
router.get(
    '/admin/users/:id',
    authMiddleware,
    roleMiddleware([UserRole.ADMIN]),
    (req: Request, res: Response) => userController.getUserById(req as any, res)
);
router.put(
    '/admin/users/:id',
    authMiddleware,
    roleMiddleware([UserRole.ADMIN]),
    (req: Request, res: Response) => userController.updateUser(req as any, res)
);
router.delete(
    '/admin/users/:id',
    authMiddleware,
    roleMiddleware([UserRole.ADMIN]),
    (req: Request, res: Response) => userController.deleteUser(req as any, res)
);

export default router;
