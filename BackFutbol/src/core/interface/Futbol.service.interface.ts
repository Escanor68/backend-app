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
}
