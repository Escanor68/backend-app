import { SoccerFieldEntities } from '../../core/entities/Futbol.entity';

export interface FutbolRepositoryInterface {
    insertData(data: SoccerFieldEntities): Promise<SoccerFieldEntities>;
    getDataUserField(userField: number): Promise<SoccerFieldEntities[]>;
    getFieldToReserve(
        owner: number,
        schedule: string,
        fieldName: string,
    ): Promise<SoccerFieldEntities | null>;
}
