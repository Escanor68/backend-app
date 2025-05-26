import type { Repository } from "typeorm"
import { Transactional } from "typeorm-transactional"
import { SoccerFieldEntities } from "../../core/entities/Futbol.entity"
import { initializeConnection } from "../utils/decorators"
import type { FutbolRepositoryInterface } from "../interfaces/Futbol.repository.interface"
import { AppError } from "../../middleware/error.middleware"

export class FutbolRepository implements FutbolRepositoryInterface {
  private futbolRepository: Repository<SoccerFieldEntities>
  constructor(futbolRepository: Repository<SoccerFieldEntities>) {
    this.futbolRepository = futbolRepository
  }

  @initializeConnection()
  @Transactional()
  async insertData(data: SoccerFieldEntities): Promise<SoccerFieldEntities> {
    try {
      const newData = new SoccerFieldEntities()
      Object.assign(newData, data)

      return this.futbolRepository.save(newData)
    } catch (error: any) {
      throw new AppError(`Error al insertar datos: ${error?.message}`, 500)
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
      })

      return fields || []
    } catch (error: any) {
      throw new AppError(`Error al traer los datos del Dueño: ${error?.message}`, 500)
    }
  }

  @initializeConnection()
  async getFieldToReserve(owner: number, schedule: string, fieldName: string): Promise<SoccerFieldEntities | null> {
    try {
      // Buscar todas la canchas donde coincida los filtros
      const fields = await this.futbolRepository.findOne({
        where: {
          owner: owner,
          schedule: schedule,
          fieldName: fieldName,
        },
      })

      return fields || null
    } catch (error: any) {
      throw new AppError(`Error al buscar la cancha: ${error?.message}`, 500)
    }
  }

  @initializeConnection()
  async getFieldById(id: string): Promise<SoccerFieldEntities | null> {
    try {
      // Buscar todas la canchas donde coincida los filtros
      const fields = await this.futbolRepository.findOne({
        where: {
          id: id,
        },
      })

      return fields || null
    } catch (error: any) {
      throw new AppError(`Error al buscar la cancha por ID: ${error?.message}`, 500)
    }
  }

  @initializeConnection()
  async getNearbyFields(lat: number, lng: number, radiusInKm = 20): Promise<SoccerFieldEntities[]> {
    return this.futbolRepository
      .createQueryBuilder("field")
      .addSelect(
        `(
                6371 * acos(
                    cos(radians(:lat)) * cos(radians(field.latitude)) *
                    cos(radians(field.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(field.latitude))
                )
            )`,
        "distance",
      )
      .having("distance <= :radius", { radius: radiusInKm })
      .setParameters({ lat, lng })
      .getMany()
  }
}
