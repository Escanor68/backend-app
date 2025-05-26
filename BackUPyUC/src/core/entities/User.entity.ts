import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ['user', 'admin'],
        default: 'user'
    })
    role: string;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ nullable: true })
    verificationToken?: string;

    @Column({ nullable: true })
    resetPasswordToken?: string;

    @Column({ nullable: true })
    resetPasswordExpires?: Date;

    @Column({ nullable: true })
    lastLogin?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 