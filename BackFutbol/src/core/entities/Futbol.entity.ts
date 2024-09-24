import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('soccerField', { schema: 'dev' })
export class SoccerFieldEntities {
    @PrimaryGeneratedColumn('uuid') // Generación de UUID como identificador único
    id: string;

    @Column({ type: 'varchar', length: 255 })
    fieldName: string; // Nombre de la cancha

    @Column({ type: 'varchar', length: 255 })
    schedule: string; // Horario de la cancha

    @Column()
    owner: number; // ID de userField (referencia externa a otro microservicio)

    @Column({ type: 'varchar', length: 8 })
    reservation: 'Active' | 'Inactive'; // Solo acepta 'Active' o 'Inactive'

    @Column({ nullable: true })
    who_reserved: number; // ID de userPlayer (referencia externa a otro microservicio)

    @Column({ type: 'int', nullable: true })
    price: number; // Precio de la cancha (opcional)
}
