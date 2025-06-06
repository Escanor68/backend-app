import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from './user.model';

@Entity()
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    token: string;

    @ManyToOne(() => User, (user) => user.passwordResetTokens, {
        onDelete: 'CASCADE',
    })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: false })
    used: boolean;
}
