import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    BeforeInsert,
} from 'typeorm';
import { Payment } from './payment.model';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    password: string;

    @Column('simple-array')
    roles: string[];

    @Column({ default: false })
    isBlocked: boolean;

    @OneToMany(() => Payment, (payment) => payment.user)
    payments: Payment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    setDefaultRole() {
        if (!this.roles || this.roles.length === 0) {
            this.roles = ['user'];
        }
    }
}
