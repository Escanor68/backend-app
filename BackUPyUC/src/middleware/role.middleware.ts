import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import { UserRole } from '../types/user.types';

export const roleMiddleware = (allowedRoles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new ApiError(HttpStatus.UNAUTHORIZED, 'Usuario no autenticado');
            }

            const hasRole = req.user.roles.some(role => allowedRoles.includes(role as UserRole));

            if (!hasRole) {
                throw new ApiError(HttpStatus.FORBIDDEN, 'No tiene permisos para esta acción');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middlewares específicos para cada rol
export const requireSuperAdmin = roleMiddleware([UserRole.SUPER_ADMIN]);
export const requireAdmin = roleMiddleware([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
export const requireModerator = roleMiddleware([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
]);
export const requireFieldOwner = roleMiddleware([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FIELD_OWNER,
]);
export const requireFieldManager = roleMiddleware([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FIELD_OWNER,
    UserRole.FIELD_MANAGER,
]);
export const requireCoach = roleMiddleware([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COACH]);
export const requireReferee = roleMiddleware([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.REFEREE,
]);
export const requireTeamCaptain = roleMiddleware([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TEAM_CAPTAIN,
]);
export const requirePlayer = roleMiddleware([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PLAYER,
    UserRole.TEAM_CAPTAIN,
]);
export const requireUser = roleMiddleware([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
    UserRole.FIELD_OWNER,
    UserRole.FIELD_MANAGER,
    UserRole.COACH,
    UserRole.REFEREE,
    UserRole.TEAM_CAPTAIN,
    UserRole.PLAYER,
    UserRole.USER,
]);
