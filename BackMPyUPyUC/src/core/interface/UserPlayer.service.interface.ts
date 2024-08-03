import { UserPlayerEntity } from '../entities/UserPlayer.entity';
import { UserPlayerObject } from '../../infrastructure/interfaces/UserPlayer.interface';

export interface UserPlayerServiceInterface {
    insertData(user: UserPlayerObject): Promise<void>;

    update(id: number, newData: Partial<UserPlayerEntity>): Promise<Boolean>;

    authenticate(
        email: string,
        password: string,
    ): Promise<{ token: string; user: UserPlayerObject } | null>;

    inactivate(id: number): Promise<Boolean>;

    sendTokenReset(email: string): Promise<Boolean>;

    resetPassword(token: string, newPassword: string): Promise<Boolean>;
}
