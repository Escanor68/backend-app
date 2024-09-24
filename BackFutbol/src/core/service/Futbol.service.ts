import { FutbolRepository } from '../../infrastructure/repositories/Futbol.repository';
import { FutbolServiceInterface } from '../interface/Futbol.service.interface';
import { SoccerFieldEntities } from '../entities/Futbol.entity'; // Asumiendo que esta es la entidad que estás usando

export class FutbolService implements FutbolServiceInterface {
    private futbolRepository: FutbolRepository;

    constructor(futbolRepository: FutbolRepository) {
        this.futbolRepository = futbolRepository;
    }

    /**
     * Crea o actualiza los turnos de juego para un campo de fútbol y los guarda en la base de datos.
     * @param owner - El ID del dueño de la cancha.
     * @param fieldName - El nombre de la cancha.
     * @param availableFrom - Hora de inicio de la disponibilidad (en formato 'HH:mm').
     * @param availableUntil - Hora de fin de la disponibilidad (en formato 'HH:mm').
     * @param price - Precio base de la cancha.
     * @returns Una promesa que resuelve con los turnos guardados o actualizados.
     */
    async crearCanchas(
        owner: number,
        fieldName: string,
        availableFrom: string,
        availableUntil: string,
        price: number,
    ): Promise<void> {
        try {
            const shifts = this.generateShifts(
                owner,
                fieldName,
                availableFrom,
                availableUntil,
                price,
            );

            for (const shift of shifts) {
                await this.futbolRepository.insertData(shift);
            }
        } catch (error: any) {
            // Asegurarte de que el error muestra el nombre de la cancha correcto
            throw new Error(
                `Error al crear los turnos para la cancha '${fieldName}': ${error?.message}`,
            );
        }
    }

    /**
     * Trae las canchas asociadas al ID del usuario propietario de las mismas.
     * @param userField - El ID del dueño de las canchas (usuario propietario).
     * @returns Una promesa que resuelve con un array de objetos SoccerFieldEntities que representan las canchas del usuario.
     * @throws Lanza un error si ocurre algún problema al obtener las canchas del repositorio.
     */
    async traerCanchas(userField: number): Promise<SoccerFieldEntities[]> {
        try {
            // Obtiene las canchas relacionadas con el userField a través del método getDataUserField
            return await this.futbolRepository.getDataUserField(userField);
        } catch (error: any) {
            // Manejo de errores personalizado que incluye el ID del usuario propietario
            throw new Error(
                `Error al traer los turnos para el usuario '${userField}': ${error?.message}`,
            );
        }
    }

    async reservarCancha(
        owner: number,
        fieldName: string,
        schedule: string,
        who_reserved_id: number,
        who_reserved_name: string,
    ): Promise<void> {
        try {
            const field = await this.futbolRepository.getFieldToReserve(
                owner,
                schedule,
                fieldName,
            );

            if (!field)
                throw new Error(
                    `No existe cancha ${fieldName} con esas especificaciones`,
                );
            if (field?.reservation === 'Active')
                throw new Error(
                    `Turno no disponible para la cancha ${fieldName}`,
                );

            field.who_reserved_id = who_reserved_id;
            field.who_reserved_name = who_reserved_name;
            field.reservation = 'Active';

            await this.futbolRepository.insertData(field);
        } catch (error: any) {
            // Manejo de errores personalizado que incluye el ID del usuario propietario
            throw new Error(
                `Error al reservar la cancha '${fieldName} para el usuario '${who_reserved_name}': ${error?.message}`,
            );
        }
    }

    /**
     * Genera los turnos de 1:30 horas dentro del rango de disponibilidad, permitiendo que el último turno se exceda por un máximo de 30 minutos.
     * @param owner - El ID del dueño de la cancha.
     * @param fieldName - El nombre de la cancha.
     * @param availableFrom - Hora de inicio de la disponibilidad (en formato 'HH:mm').
     * @param availableUntil - Hora de fin de la disponibilidad (en formato 'HH:mm').
     * @param price - Precio base de la cancha.
     * @returns Un array de objetos SoccerField con los turnos generados.
     */
    private generateShifts(
        owner: number,
        fieldName: string,
        availableFrom: string,
        availableUntil: string,
        price: number,
    ): SoccerFieldEntities[] {
        try {
            const shifts: SoccerFieldEntities[] = [];

            // Validación de formato HH:mm
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (
                !timeRegex.test(availableFrom) ||
                !timeRegex.test(availableUntil)
            ) {
                throw new Error('Los horarios deben estar en el formato HH:mm');
            }

            // Convertir las horas a objetos Date usando la fecha 1970-01-01 para normalizar
            const fromTime = new Date(`1970-01-01T${availableFrom}:00`);
            const untilTime = new Date(`1970-01-01T${availableUntil}:00`);

            // Validar que fromTime sea menor que untilTime
            if (fromTime >= untilTime) {
                throw new Error(
                    'La hora de inicio debe ser anterior a la hora de fin',
                );
            }

            // Definir el margen de media hora (30 minutos) permitido para exceder el último turno
            const maxExceedTime = new Date(
                untilTime.getTime() + 30 * 60 * 1000,
            );

            // Iterar en intervalos de 1:30 horas
            let currentTime = fromTime;
            while (currentTime < maxExceedTime) {
                const nextTime = new Date(
                    currentTime.getTime() + 90 * 60 * 1000,
                ); // Agregar 1:30 horas

                // Permitir turnos que excedan hasta 30 minutos
                if (nextTime <= maxExceedTime) {
                    // Crear el turno
                    const shift = new SoccerFieldEntities();
                    shift.owner = owner;
                    shift.fieldName = fieldName;

                    // Formatear el rango de horario en 'HH:mm a HH:mm'
                    const startTime = this.formatTime(currentTime);
                    const endTime = this.formatTime(nextTime);
                    shift.schedule = `${startTime} a ${endTime}`;

                    shift.price = price + price * 0.1; // Agregar 10% al precio base
                    shift.reservation = 'Inactive'; // Se marca como no reservado por defecto

                    // Añadir el turno a la lista
                    shifts.push(shift);
                }

                // Avanzar al siguiente turno
                currentTime = nextTime;
            }

            return shifts;
        } catch (error: any) {
            // Manejo de error durante la generación de los turnos
            throw new Error(
                `Error al generar los turnos para la cancha '${fieldName}': ${error?.message}`,
            );
        }
    }

    // Método para formatear la fecha a 'HH:mm'
    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}
