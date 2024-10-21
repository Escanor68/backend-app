import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'restorePassword' })
export class ResetPasswordEntity {
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({
        name: 'token',
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
