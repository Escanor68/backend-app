import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    userId!: string;

    @Column()
    action!: string;

    @Column()
    resource!: string;

    @Column({ nullable: true })
    resourceId!: string | null;

    @Column()
    ipAddress!: string;

    @Column({ type: 'text' })
    userAgent!: string;

    @Column()
    success!: boolean;

    @Column({ type: 'json', nullable: true })
    details!: any;

    @Column({ default: false })
    sensitiveData!: boolean;

    @Column({ nullable: true })
    dataHash!: string;

    @CreateDateColumn()
    timestamp!: Date;
}
