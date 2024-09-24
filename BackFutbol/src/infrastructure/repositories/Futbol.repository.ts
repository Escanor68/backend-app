import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { SoccerFieldEntities } from '../../core/entities/Futbol.entity';
import { initializeConnection } from '../utils/decorators';
import { FutbolRepositoryInterface } from '../interfaces/Futbol.repository.interface';

export class FutbolRepository implements FutbolRepositoryInterface {
    private futbolRepository: Repository<SoccerFieldEntities>;
    constructor(futbolRepository: Repository<SoccerFieldEntities>) {
        this.futbolRepository = futbolRepository;
    }

    @initializeConnection()
    @Transactional()
    async insertData(data: SoccerFieldEntities): Promise<SoccerFieldEntities> {
        try {
            const newData = new SoccerFieldEntities();
            Object.assign(newData, data);

            return this.futbolRepository.save(newData);
        } catch (error: any) {
            throw new Error(
                'Error al insertar datos de usuario: ' + error?.message,
            );
        }
    }
}
