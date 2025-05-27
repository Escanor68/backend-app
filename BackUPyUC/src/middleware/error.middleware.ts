import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../core/errors/api.error';
import { HttpStatus } from '../core/constants';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      status: error.status,
      message: error.message
    });
  }

  // Log error for debugging
  console.error(error);

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error'
  });
}; 