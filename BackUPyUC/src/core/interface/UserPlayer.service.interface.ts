import { UserPlayerEntity } from '../entities/UserPlayer.entity';

export interface UserPlayerServiceInterface {
    insertData(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        birthDate: string,
        gender: string,
        phoneNumber: string,
        dni: string,
    ): Promise<void>;

    update(id: string, newData: Partial<UserPlayerEntity>): Promise<Boolean>;

    authenticate(
        email: string,
        password: string,
    ): Promise<{ token: string; user: UserPlayerEntity } | null>;

    inactivate(id: string): Promise<Boolean>;

    sendTokenReset(email: string): Promise<Boolean>;

    resetPassword(token: string, newPassword: string): Promise<Boolean>;
}
