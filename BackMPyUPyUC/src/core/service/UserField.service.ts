import { UsersServiceInterface } from '../interface/Users.service.interface';
import { UsersRepositoryInterface } from '../../infrastructure/interfaces/UserPlayer.repository.interface';
import { UsersObject } from '../../infrastructure/interfaces/';
import { UsersEntity } from '../entities/Users.entity';

export class UsersService implements UsersServiceInterface {
    private usersRepository: UsersRepositoryInterface;
    constructor(usersRepository: UsersRepositoryInterface) {
        this.usersRepository = usersRepository;
    }

    public async getAll(): Promise<Array<UsersObject> | null> {
        return this.usersRepository.getAll();
    }

    public async getId(id: number): Promise<UsersObject | null> {
        return this.usersRepository.getId(id);
    }

    public async search(name: string): Promise<UsersObject | null> {
        try {
            return await this.usersRepository.search(name);
        } catch (error) {
            throw new Error('' + error);
        }
    }

    public async insertData(user: UsersObject): Promise<void> {
        try {
            await this.usersRepository.insertData(user);
        } catch (error) {
            throw new Error('Error in insert data' + error);
        }
    }

    public async update(
        id: number,
        newData: Partial<UsersEntity>,
    ): Promise<Boolean> {
        try {
            const user = await this.usersRepository.getId(id);

            if (!user) {
                return false;
            }

            Object.assign(user, newData);

            await this.usersRepository.insertData(user);
            return true;
        } catch (error) {
            throw new Error('Error in  update data' + error);
        }
    }
}
