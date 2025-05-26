import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../core/errors/UnauthorizedError';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
        } else {
            next(error);
        }
    }
};

export const hasRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError('Insufficient permissions');
        }

        next();
    };
}; 