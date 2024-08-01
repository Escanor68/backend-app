import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuarios' })
export class UserPlayerEntity {
    // Columna de clave primaria generada automáticamente con tipo UUID
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Columna para almacenar los nombres de los usuarios
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false, // No se permite el valor nulo
        unique: true, // Valores únicos en esta columna
    })
    nombres: string;

    // Columna para almacenar los apellidos de los usuarios
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false, // No se permite el valor nulo
        unique: true, // Valores únicos en esta columna
    })
    apellidos: string;

    // Columna para almacenar la fecha de nacimiento de los usuarios
    @Column({ type: 'datetime' })
    nacimiento: Date;

    // Columna para almacenar el CUIT (Clave Única de Identificación Tributaria) de los usuarios
    @Column({
        type: 'varchar',
        length: 20,
        nullable: false, // No se permite el valor nulo
    })
    cuit: string;

    // Columna para almacenar el domicilio de los usuarios
    @Column({
        type: 'varchar',
        length: 255,
    })
    domicilio: string;

    // Columna para almacenar el número de celular de los usuarios
    @Column({
        type: 'varchar',
        length: 20,
        nullable: false, // No se permite el valor nulo
    })
    celular: string;

    // Columna para almacenar el correo electrónico de los usuarios
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false, // No se permite el valor nulo
        unique: true, // Valores únicos en esta columna
    })
    email: string;
}
