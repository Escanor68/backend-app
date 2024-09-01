import { Repository } from 'typeorm';
import { initializeConnection } from '../utils/decorators';
import { Transactional } from 'typeorm-transactional';
import { UserPlayerRepositoryInterface } from '../interfaces/UserPlayer.repository.interface';
import { UserPlayerEntity } from '../../core/entities/UserPlayer.entity';
import moment from 'moment';

export class UserPlayerRepository implements UserPlayerRepositoryInterface {
    private userPlayerRepository: Repository<UserPlayerEntity>;

    constructor(userPlayerRepository: Repository<UserPlayerEntity>) {
        this.userPlayerRepository = userPlayerRepository;
    }

    @initializeConnection()
    async getId(id: number): Promise<UserPlayerEntity | null> {
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
        } catch (error) {
            console.error('Error in search:', error);
            return null;
        }
    }

    @initializeConnection()
    @Transactional()
    async insertData(data: UserPlayerEntity): Promise<UserPlayerEntity> {
        try {
            const newData = new UserPlayerEntity();
            Object.assign(newData, data);

            return this.userPlayerRepository.save(newData);
        } catch (error) {
            throw new Error('Error al insertar datos de usuario: ' + error);
        }
    }

    @initializeConnection()
    @Transactional()
    async updateData(data: UserPlayerEntity): Promise<UserPlayerEntity> {
        try {
            const newData = new UserPlayerEntity();
            Object.assign(newData, data);

            return this.userPlayerRepository.save(newData);
        } catch (error) {
            throw new Error('Error al actualizar datos de usuario: ' + error);
        }
    }
}
