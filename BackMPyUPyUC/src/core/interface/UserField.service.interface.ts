import { UserFieldEntity } from '../entities/UserField.entity';
import { UserFieldObject } from '../../infrastructure/interfaces/UserField.interface';

export interface UserFieldServiceInterface {
    insertData(user: UserFieldObject): Promise<void>;

    update(id: number, newData: Partial<UserFieldEntity>): Promise<Boolean>;

    authenticate(
        email: string,
        password: string,
    ): Promise<{ token: string; user: UserFieldObject } | null>;

    inactivate(id: number): Promise<Boolean>;

    sendTokenReset(email: string): Promise<Boolean>;

    resetPassword(token: string, newPassword: string): Promise<Boolean>;
}