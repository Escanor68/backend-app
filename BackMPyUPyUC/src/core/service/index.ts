import { UserPlayerService } from './UserPlayer.service';
import { userPlayerRepository } from '../../infrastructure/repositories';

export const userPlayerService = new UserPlayerService(userPlayerRepository);
