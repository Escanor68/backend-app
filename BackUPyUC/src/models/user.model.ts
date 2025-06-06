import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { FavoriteField } from './favorite-field.model';
import { Notification } from './notification.model';
import { PasswordResetToken } from './password-reset-token.model';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    phone?: string;

    @Column('simple-array', { default: ['user'] })
    roles: string[];

    @Column('json', { nullable: true })
    preferredLocation?: {
        lat: number;
        lng: number;
    };

    @Column('json', { default: { email: true, push: true, sms: false } })
    notificationPreferences: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };

    @Column({ default: false })
    isBlocked: boolean;

    @OneToMany(() => FavoriteField, favoriteField => favoriteField.user)
    favoriteFields: FavoriteField[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[];

    @OneToMany(() => PasswordResetToken, prt => prt.user)
    passwordResetTokens: PasswordResetToken[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
