import { userPlayerRepository as userPlayerRepositoryImport } from '../datasource/mysql.datasource';
import { UserPlayerRepository } from './UserPlayer.repository';
import { resetPasswordRepository as resetPasswordRepositoryImport } from '../datasource/mysql.datasource';
import { ResetPasswordRepository } from './ResetPassword.repository';
import { userFieldRepository as userFieldRepositoryImport } from '../datasource/mysql.datasource';
import { UserFieldRepository } from './UserField.repository';

export const userPlayerRepository = new UserPlayerRepository(
    userPlayerRepositoryImport,
);
export const resetPasswordRepository = new ResetPasswordRepository(
    resetPasswordRepositoryImport,
);
export const userFieldRepository = new UserFieldRepository(
    userFieldRepositoryImport,
);