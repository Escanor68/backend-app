import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    token: string;

    @ManyToOne(() => User)
    user: User;

    @Column()
    expiresAt: Date;

    @Column({ default: false })
    used: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
