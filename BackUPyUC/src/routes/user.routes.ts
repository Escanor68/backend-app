import { Router } from 'express';
import { UserController } from '../api/controllers/user.controller';
import { UserService } from '../api/services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// All routes are protected
router.use(authMiddleware);

// Profile routes
router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);

// Bookings routes
router.get('/me/bookings', userController.getBookings);

// Favorites routes
router.get('/me/favorites', userController.getFavorites);
router.post('/me/favorites/:fieldId', userController.addFavorite);
router.delete('/me/favorites/:fieldId', userController.removeFavorite);

export default router; 