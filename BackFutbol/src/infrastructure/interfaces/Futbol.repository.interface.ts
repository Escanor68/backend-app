import { SoccerFieldEntities } from '../../core/entities/Futbol.entity';

export interface FutbolRepositoryInterface {
    insertData(data: SoccerFieldEntities): Promise<SoccerFieldEntities>;
}
