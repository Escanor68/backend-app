import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

@Entity('password_reset_tokens')
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    token!: string;

    @ManyToOne(() => User, user => user.passwordResetTokens)
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    expiresAt!: Date;

    @Column({ default: false })
    used!: boolean;
}
