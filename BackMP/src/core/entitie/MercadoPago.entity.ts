import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'transaction' }) // Especificamos el esquema y el nombre de la tabla
export class TransactionEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    transaction_id!: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    status?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    status_detail?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    payment_method_id?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    payment_type_id?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    transaction_amount?: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    token?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description?: string;

    @Column({ type: 'int', nullable: true })
    installments?: number;

    @Column({ type: 'int', nullable: true })
    issuer_id?: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    payer_email?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    payer_identification_type?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    payer_identification_number?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date_created!: Date;

    @Column({ type: 'timestamp', nullable: true })
    date_approved?: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    external_reference?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    notification_url?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at!: Date;
}
