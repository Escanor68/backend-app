import { AuthService } from '../../../src/core/services/auth.service';
import { UserService } from '../../../src/core/services/user.service';
import { mockUser } from '../../mocks/user.mock';
import { ApiError } from '../../../src/core/errors/api.error';

jest.mock('../../../src/core/services/user.service');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    userService = new UserService() as jest.Mocked<UserService>;
    authService = new AuthService();
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Test123!'
      };

      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(authService as any, 'validatePassword').mockResolvedValue(true);

      const result = await authService.login(credentials.email, credentials.password);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(credentials.email);
    });

    it('should throw error when user not found', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Test123!'
      };

      userService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login(credentials.email, credentials.password)
      ).rejects.toThrow(ApiError);
    });
  });
}); 