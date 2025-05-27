import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

@Entity('favorite_fields')
export class FavoriteField {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fieldId: string;

    @Column()
    name: string;

    @ManyToOne(() => User, user => user.favoriteFields)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
} 