import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

@Entity()
export class PasswordReset {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user!: User;

    @Column()
    token!: string;

    @Column()
    used!: boolean;

    @Column()
    expiresAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}
