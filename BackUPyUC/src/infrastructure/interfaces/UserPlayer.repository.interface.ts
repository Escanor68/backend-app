import { UserPlayerEntity } from '../../core/entities/UserPlayer.entity';

export interface UserPlayerRepositoryInterface {
    getId(id: string): Promise<any>;

    search(email: string): Promise<any>;

    insertData(data: UserPlayerEntity): Promise<any>;

    updateData(data: UserPlayerEntity): Promise<UserPlayerEntity>;
}
