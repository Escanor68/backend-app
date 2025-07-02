import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('blacklisted_tokens')
export class BlacklistedToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    @Index()
    token!: string;

    @Column()
    userId!: string;

    @Column()
    expiresAt!: Date;

    @Column({ default: 'logout' })
    reason!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
