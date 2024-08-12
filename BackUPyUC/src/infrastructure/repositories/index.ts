import { userPlayerRepository as userPlayerRepositoryImport } from '../datasource/mysql.datasource';
import { UserPlayerRepository } from './UserPlayer.repository';
import { resetPasswordRepository as resetPasswordRepositoryImport } from '../datasource/mysql.datasource';
import { ResetPasswordRepository } from './ResetPassword.repository';

export const userPlayerRepository = new UserPlayerRepository(
    userPlayerRepositoryImport,
);
export const resetPasswordRepository = new ResetPasswordRepository(
    resetPasswordRepositoryImport,
);
