import { userPlayerRepository as userPlayerRepositoryImport } from '../datasource/mysql.datasource';
import { UserPlayerRepository } from './UserPlayer.repository';

// Creación de una instancia de UserPlayerRepository usando userPlayerRepositoryImport como argumento
export const userPlayerRepository = new UserPlayerRepository(
    userPlayerRepositoryImport,
);
