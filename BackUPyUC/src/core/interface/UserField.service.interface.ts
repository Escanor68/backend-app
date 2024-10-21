import { UserFieldEntity } from '../entities/UserField.entity';

export interface UserFieldServiceInterface {
    insertData(
        field_name: string,
        email: string,
        password: string,
        phoneNumber: string,
        tax_id: string,
        address: string,
    ): Promise<void>;

    update(id: string, newData: Partial<UserFieldEntity>): Promise<Boolean>;

    authenticate(
        email: string,
        password: string,
    ): Promise<{ token: string; user: UserFieldEntity } | null>;

    inactivate(id: string): Promise<Boolean>;

    sendTokenReset(email: string): Promise<Boolean>;

    resetPassword(token: string, newPassword: string): Promise<Boolean>;

    getNearbyFields(
        userLat: number,
        userLng: number,
    ): Promise<UserFieldEntity[]>;
}
