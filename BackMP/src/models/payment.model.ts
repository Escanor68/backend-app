import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
    lastSentAt: Date;
  } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 