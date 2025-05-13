import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'userPlayer' })
export class UserPlayerEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'first_name',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    firstName: string;

    @Column({
        name: 'last_name',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    lastName: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
        unique: true,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    password: string;

    @Column({
        name: 'birth_date',
        type: 'date',
        nullable: true,
    })
    birthDate: Date;

    @Column({
        type: 'enum',
        enum: ['M', 'F', 'Other'],
        nullable: true,
    })
    gender: 'M' | 'F' | 'Other';

    @Column({
        name: 'phone_number',
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    phoneNumber: string;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @Column({
        type: 'enum',
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE',
    })
    status: 'ACTIVE' | 'INACTIVE';

    @Column({
        type: 'varchar',
        length: 10,
        nullable: true,
    })
    dni: string;
}
