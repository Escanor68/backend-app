import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';

export enum PaymentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled'
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    amount: number;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column({ nullable: true })
    mpPaymentId?: string;

    @Column({ nullable: true })
    mpPreferenceId?: string;

    @Column({ type: 'json', nullable: true })
    mpResponse?: any;

    @Column({ nullable: true })
    paymentMethod?: string;

    @Column({ nullable: true })
    installments?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    transactionAmount?: number;

    @Column({ nullable: true })
    currency?: string;

    @Column({ type: 'json', nullable: true })
    metadata?: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 