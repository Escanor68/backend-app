import { Repository } from 'typeorm';
import { initializeConnection } from '../utils/decorators';
import { Transactional } from 'typeorm-transactional';
import { UserPlayerRepositoryInterface } from '../interfaces/UserPlayer.repository.interface';
import { UserPlayerEntity } from '../../core/entities/UserPlayer.entity';

export class UserPlayerRepository implements UserPlayerRepositoryInterface {
    private userPlayerRepository: Repository<UserPlayerEntity>;

    constructor(userPlayerRepository: Repository<UserPlayerEntity>) {
        this.userPlayerRepository = userPlayerRepository;
    }

    @initializeConnection()
    async getId(id: string): Promise<UserPlayerEntity | null> {
        return (
            (await this.userPlayerRepository
                .createQueryBuilder('userPlayer')
                .select([])
                .where('id = :id', { id: id })
                .getRawOne()) || null
        );
    }

    @initializeConnection()
    async search(email: string): Promise<UserPlayerEntity | null> {
        try {
            const user = await this.userPlayerRepository
                .createQueryBuilder('userPlayer')
                .where('userPlayer.email = :email', {
                    email: email.trim().toLowerCase(),
                })
                .getOne();

            return user || null;
        } catch (error: any) {
            console.error('Error in search:', error?.message);
            return null;
        }
    }

    @initializeConnection()
    @Transactional()
    async insertData(user: UserPlayerEntity): Promise<UserPlayerEntity> {
        try {
            return this.userPlayerRepository.save(user);
        } catch (error: any) {
            throw new Error(
                'Error al insertar datos de usuario: ' + error?.message,
            );
        }
    }

    @initializeConnection()
    @Transactional()
    async updateData(data: UserPlayerEntity): Promise<UserPlayerEntity> {
        try {
            const newData = new UserPlayerEntity();
            Object.assign(newData, data);

            return this.userPlayerRepository.save(newData);
        } catch (error: any) {
            throw new Error(
                'Error al actualizar datos de usuario: ' + error?.message,
            );
        }
    }
}
