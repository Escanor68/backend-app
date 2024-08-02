import { userPlayerRepository as userPlayerRepositoryImport } from '../datasource/mysql.datasource';
import { UserPlayerRepository } from './UserPlayer.repository';

export const userPlayerRepository = new UserPlayerRepository(
    userPlayerRepositoryImport,
);
