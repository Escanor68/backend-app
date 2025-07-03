import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { FavoriteField } from './favorite-field.model';
import { Notification } from './notification.model';
import { PasswordResetToken } from './password-reset-token.model';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../types/user.types';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({
        type: 'json',
        nullable: false,
        transformer: {
            to: (value: any) => (Array.isArray(value) ? value : [value]),
            from: (value: any) => (Array.isArray(value) ? value : [value]),
        },
        default: '["user"]',
    })
    roles!: UserRole[];

    @Column('json', { nullable: true })
    preferredLocation?: {
        lat: number;
        lng: number;
    };

    @Column({
        type: 'json',
        nullable: true,
    })
    notificationPreferences!: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };

    @Column({ default: false })
    isBlocked!: boolean;

    @Column({ nullable: true })
    resetToken?: string;

    @Column({ nullable: true })
    resetTokenExpiry?: Date;

    @OneToMany(() => FavoriteField, favoriteField => favoriteField.user)
    favoriteFields!: FavoriteField[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications!: Notification[];

    @OneToMany(() => PasswordResetToken, prt => prt.user)
    passwordResetTokens!: PasswordResetToken[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}
