import { UserPlayerServiceInterface } from '../interface/UserPlayer.service.interface';
import { UserPlayerRepositoryInterface } from '../../infrastructure/interfaces/UserPlayer.repository.interface';
import { UserPlayerObject } from '../../infrastructure/interfaces/UserPlayer.interface';
import { UserPlayerEntity } from '../entities/UserPlayer.entity';

export class UserPlayerService implements UserPlayerServiceInterface {
  private userPlayerRepository: UserPlayerRepositoryInterface;
  constructor(userPlayerRepository: UserPlayerRepositoryInterface) {
    this.userPlayerRepository = userPlayerRepository;
  }

  public async getAll(): Promise<Array<UserPlayerObject> | null> {
    return this.userPlayerRepository.getAll();
  }

  public async getId(id: number): Promise<UserPlayerObject | null> {
    return this.userPlayerRepository.getId(id);
  }

  public async search(name: string): Promise<UserPlayerObject | null> {
    try {
      return await this.userPlayerRepository.search(name);
    } catch (error) {
      throw new Error('' + error);
    }
  }

  public async insertData(user: UserPlayerObject): Promise<void> {
    try {
      await this.userPlayerRepository.insertData(user);
    } catch (error) {
      throw new Error('Error in insert data' + error);
    }
  }

  public async update(
    id: number,
    newData: Partial<UserPlayerEntity>
  ): Promise<Boolean> {
    try {
      const user = await this.userPlayerRepository.getId(id);

      if (!user) {
        return false;
      }

      Object.assign(user, newData);

      await this.userPlayerRepository.insertData(user);
      return true;
    } catch (error) {
      throw new Error('Error in  update data' + error);
    }
  }
}
