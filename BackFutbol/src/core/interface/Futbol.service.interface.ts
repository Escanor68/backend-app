import { SoccerFieldEntities } from '../entities/Futbol.entity';

export interface FutbolServiceInterface {
    crearCanchas(
        owner: number,
        fieldName: string,
        availableFrom: string,
        availableUntil: string,
        price: number,
    ): Promise<void>;

    traerCanchas(userField: number): Promise<SoccerFieldEntities[]>;

    reservarCancha(
        owner: number,
        fieldName: string,
        schedule: string,
        who_reserved_id: number,
        who_reserved_name: string,
    ): Promise<void>;

    liberarCancha(id: string): Promise<void>;
}
