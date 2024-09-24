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

    @initializeConnection()
    async getDataUserField(userField: number): Promise<SoccerFieldEntities[]> {
        try {
            // Buscar todas las canchas donde el campo 'owner' coincida con el userField dado
            const fields = await this.futbolRepository.find({
                where: {
                    owner: userField,
                },
            });

            return fields || [];
        } catch (error: any) {
            throw new Error(
                'Error al traer los datos del Dueño: ' + error?.message,
            );
        }
    }

    @initializeConnection()
    async getFieldToReserve(
        owner: number,
        schedule: string,
        fieldName: string,
    ): Promise<SoccerFieldEntities | null> {
        try {
            // Buscar todas la canchas donde coincida los filtros
            const fields = await this.futbolRepository.findOne({
                where: {
                    owner: owner,
                    schedule: schedule,
                    fieldName: fieldName,
                },
            });

            return fields || null;
        } catch (error: any) {
            throw new Error(
                'Error al traer los datos del Dueño: ' + error?.message,
            );
        }
    }
}
