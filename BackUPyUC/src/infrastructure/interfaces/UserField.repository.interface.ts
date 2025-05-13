import { UserFieldEntity } from '../../core/entities/UserField.entity';

export interface UserFieldRepositoryInterface {
    getId(id: string): Promise<UserFieldEntity | null>;

    getAll(): Promise<UserFieldEntity[] | null>;

    search(email: string): Promise<UserFieldEntity | null>;

    insertData(data: UserFieldEntity): Promise<UserFieldEntity>;

    updateData(data: UserFieldEntity): Promise<UserFieldEntity>;
}
