import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ['booking_reminder', 'payment_pending', 'booking_cancelled']
    })
    type: 'booking_reminder' | 'payment_pending' | 'booking_cancelled';

    @Column()
    message: string;

    @Column({ default: false })
    read: boolean;

    @ManyToOne(() => User, user => user.notifications)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
} 