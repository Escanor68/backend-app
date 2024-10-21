import { Repository } from 'typeorm';
import { initializeConnection } from '../utils/decorators';
import { Transactional } from 'typeorm-transactional';
import { UserFieldRepositoryInterface } from '../interfaces/UserField.repository.interface';
import { UserFieldEntity } from '../../core/entities/UserField.entity';
import moment from 'moment';

export class UserFieldRepository implements UserFieldRepositoryInterface {
    private userFieldRepository: Repository<UserFieldEntity>;

    constructor(userFieldRepository: Repository<UserFieldEntity>) {
        this.userFieldRepository = userFieldRepository;
    }

    @initializeConnection()
    async getAll(): Promise<UserFieldEntity[] | null> {
        try {
            return await this.userFieldRepository.find({
                where: { status: 'ACTIVE' },
            });
        } catch (error: any) {
            console.error('Error in search:', error?.message);
            return null;
        }
    }

    @initializeConnection()
    async getId(id: number): Promise<UserFieldEntity | null> {
        return (
            (await this.userFieldRepository
                .createQueryBuilder('userField')
                .select([])
                .where('id = :id', { id: id })
                .getRawOne()) || null
        );
    }

    @initializeConnection()
    async search(email: string): Promise<UserFieldEntity | null> {
        try {
            const user = await this.userFieldRepository
                .createQueryBuilder('userField')
                .where('userField.email = :email', { email })
                .getOne();

            return user || null;
        } catch (error) {
            console.error('Error in search:', error);
            return null;
        }
    }

    @initializeConnection()
    @Transactional()
    async insertData(data: UserFieldEntity): Promise<UserFieldEntity> {
        try {
            const newData = new UserFieldEntity();
            Object.assign(newData, data);

            newData.createdAt = new Date();

            return this.userFieldRepository.save(newData);
        } catch (error) {
            throw new Error('Error al insertar datos de usuario: ' + error);
        }
    }

    @initializeConnection()
    @Transactional()
    async updateData(data: UserFieldEntity): Promise<UserFieldEntity> {
        try {
            const newData = new UserFieldEntity();
            Object.assign(newData, data);

            newData.updatedAt = new Date(
                moment().format('yyyy-mm-dd hh:mm:ss'),
            );

            return this.userFieldRepository.save(newData);
        } catch (error) {
            throw new Error('Error al actualizar datos de usuario: ' + error);
        }
    }
}
