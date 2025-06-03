import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

// Interface para el User (en caso de que no esté definido)
export interface User {
    id: string;
    email: string;
    name?: string;
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    bookingId: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    status: string;

    @Column({ name: 'payment_method' })
    paymentMethod: string;

    @Column('json')
    field: {
        id: string;
        name: string;
    };

    @Column({ nullable: true })
    preferenceId: string;

    @Column({ nullable: true })
    mercadoPagoId: string;

    // Agregar relación con usuario
    @Column('uuid', { nullable: true })
    userId: string;

    @ManyToOne('User', { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Agregar campo metadata
    @Column('json', { nullable: true })
    metadata: Record<string, any> | null;

    @Column('json', { nullable: true })
    refund: {
        status: string;
        reason: string;
        amount: number;
        date: Date;
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
