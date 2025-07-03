import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';
import {
    requireAdmin,
    requireModerator,
    requireFieldOwner,
    requireFieldManager,
    requireCoach,
    requireReferee,
    requireTeamCaptain,
    requirePlayer,
    requireUser,
} from '../middleware/role.middleware';

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

// Rutas protegidas - Accesibles para todos los usuarios autenticados
router.get('/profile', authMiddleware, requireUser, (req: Request, res: Response) =>
    userController.getProfile(req as any, res)
);
router.put('/profile', authMiddleware, requireUser, (req: Request, res: Response) =>
    userController.updateProfile(req as any, res)
);
router.post('/change-password', authMiddleware, requireUser, (req: Request, res: Response) =>
    userController.changePassword(req as any, res)
);

// Rutas de campos favoritos - Solo para jugadores y capitanes
router.get('/favorite-fields', authMiddleware, requirePlayer, (req: Request, res: Response) =>
    userController.getFavoriteFields(req as any, res)
);
router.post('/favorite-fields', authMiddleware, requirePlayer, (req: Request, res: Response) =>
    userController.addFavoriteField(req as any, res)
);
router.delete(
    '/favorite-fields/:fieldId',
    authMiddleware,
    requirePlayer,
    (req: Request, res: Response) => userController.removeFavoriteField(req as any, res)
);

// Rutas de notificaciones - Para todos los usuarios
router.get('/notifications', authMiddleware, requireUser, (req: Request, res: Response) =>
    userController.getNotifications(req as any, res)
);
router.put('/notifications/:id/read', authMiddleware, requireUser, (req: Request, res: Response) =>
    userController.markNotificationAsRead(req as any, res)
);

// Rutas de administración - Solo para administradores y moderadores
router.get('/admin/users', authMiddleware, requireAdmin, (req: Request, res: Response) =>
    userController.getAllUsers(req as any, res)
);
router.get('/admin/users/:id', authMiddleware, requireAdmin, (req: Request, res: Response) =>
    userController.getUserById(req as any, res)
);
router.put('/admin/users/:id', authMiddleware, requireAdmin, (req: Request, res: Response) =>
    userController.updateUser(req as any, res)
);
router.delete('/admin/users/:id', authMiddleware, requireAdmin, (req: Request, res: Response) =>
    userController.deleteUser(req as any, res)
);

export default router;
