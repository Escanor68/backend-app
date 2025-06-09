import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.model';
import { Booking } from './booking.model';
import { PaymentStatus, PaymentMetadata } from '../types/payment.types';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    bookingId: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({ name: 'payment_method' })
    paymentMethod: string;

    @Column('json')
    field: {
        id: string;
        name: string;
        ownerId: string;
        ownerName: string;
        ownerEmail: string;
        location: string;
        price: number;
    };

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @Column({ nullable: true })
    preferenceId: string;

    @Column({ nullable: true })
    mercadoPagoId: string;

    @Column('uuid', { nullable: true })
    userId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column('json', { nullable: true })
    metadata: PaymentMetadata;

    @Column({ nullable: true })
    externalId: string;

    @Column('json', { nullable: true })
    refund: {
        id?: string;
        status: string;
        reason: string;
        amount: number;
        date: Date;
        mercadoPagoRefundId?: string;
        metadata?: any;
    } | null;

    @Column('json', { nullable: true })
    invoice: {
        number: string;
        url: string;
        sentTo: string[];
        lastSentAt: Date | null;
    } | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
