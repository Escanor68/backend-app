import { UserFieldEntity } from '../../core/entities/UserField.entity';

export interface UserFieldRepositoryInterface {
    getId(id: number): Promise<any>;

    search(email: string): Promise<any>;

    insertData(data: object): Promise<any>;

    updateData(data: UserFieldEntity): Promise<UserFieldEntity>;
}
