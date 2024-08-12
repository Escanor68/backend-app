import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'userField' })
export class ResetPasswordEntity {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({
        name: 'Field_name',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    token: string;

    @CreateDateColumn({
        name: 'expiate_token',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    expiateToken: Date;
}
