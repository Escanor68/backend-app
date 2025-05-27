import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { validateLoginInput, validateRegisterInput } from '../validators/auth.validator';
import { HttpStatus } from '../../core/constants';
import { ApiError } from '../../core/errors/api.error';

export class AuthController {
  constructor(private authService: AuthService) {}

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateLoginInput(req.body);
      if (error) {
        throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
      }

      const { email, password } = value;
      const result = await this.authService.login(email, password);
      
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      }
    }
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRegisterInput(req.body);
      if (error) {
        throw new ApiError(HttpStatus.BAD_REQUEST, error.details[0].message);
      }

      const result = await this.authService.register(value);
      res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      }
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      await this.authService.logout(userId);
      res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      }
    }
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ApiError(HttpStatus.BAD_REQUEST, 'Refresh token is required');
      }

      const result = await this.authService.refreshToken(refreshToken);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      }
    }
  };
} 