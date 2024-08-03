import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'userField' })
export class UserFieldEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'Field_name',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    fieldName: string;

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
        length: 20,
        nullable: false,
    })
    tax_id: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
    })
    address: string;
}
