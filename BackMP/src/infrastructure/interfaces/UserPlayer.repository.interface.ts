import { UserPlayerEntity } from '../../core/entities/UserPlayer.entity';

export interface UserPlayerRepositoryInterface {
    getId(id: number): Promise<any>;

    search(email: string): Promise<any>;

    insertData(data: object): Promise<any>;

    updateData(data: UserPlayerEntity): Promise<UserPlayerEntity>;
}
