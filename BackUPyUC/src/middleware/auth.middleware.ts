import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatus } from '../core/constants';
import { ApiError } from '../core/errors/api.error';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'No token provided');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token format');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      req.user = decoded;
      next();
    } catch (error) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }
}; 