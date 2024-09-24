import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('soccerField', { schema: 'dev' })
export class SoccerFieldEntities {
    // Generación automática de la clave primaria con UUID
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Nombre de la cancha
    @Column({ type: 'varchar', length: 255 })
    fieldName: string;

    // Horario de la cancha (manejando como cadena, pero podrías usar un tipo TIME si se ajusta a tu lógica)
    @Column({ type: 'varchar', length: 255 })
    schedule: string;

    // ID del dueño de la cancha (userField), referencia a otro servicio
    @Column({ type: 'int' })
    owner: number;

    // Estado de la reserva, aceptando solo 'Active' o 'Inactive'
    @Column({ type: 'varchar', length: 8 })
    reservation: 'Active' | 'Inactive';

    // ID del jugador que reservó (userPlayer), este campo es opcional
    @Column({ type: 'int', nullable: true })
    who_reserved_id: number | null;

    // Nombre del jugador que reservó (opcional)
    @Column({ type: 'varchar', length: 255, nullable: true })
    who_reserved_name: string | null;

    // Precio de la cancha
    @Column({ type: 'int', nullable: false })
    price: number;
}
