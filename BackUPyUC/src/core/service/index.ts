import { UserPlayerService } from './UserPlayer.service';
import { userPlayerRepository } from '../../infrastructure/repositories';
import { UserFieldService } from './UserField.service';
import { userFieldRepository } from '../../infrastructure/repositories';
import { resetPasswordRepository } from '../../infrastructure/repositories';


export const userPlayerService = new UserPlayerService(
    userPlayerRepository,
    resetPasswordRepository,
);

export const userFieldService = new UserFieldService(
    userFieldRepository,
    resetPasswordRepository,
);