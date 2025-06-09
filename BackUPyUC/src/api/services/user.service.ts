import { AppDataSource } from '../../config/database';
import { User } from '../../models/user.model';
import { ApiError } from '../../core/errors/api.error';
import { HttpStatus } from '../../core/constants';
import bcrypt from 'bcrypt';
import { RegisterDto } from '../dto/auth.dto';
import { UserRole } from '../../types/user.types';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(userData: RegisterDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new ApiError('El email ya está registrado', HttpStatus.CONFLICT);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
            roles: [UserRole.USER],
        });

        return this.userRepository.save(user);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async getUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return null;
        }
        Object.assign(user, userData);
        return this.userRepository.save(user);
    }

    async deleteUser(id: number): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async blockUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        user.isBlocked = true;
        await this.userRepository.save(user);
        return true;
    }

    async unblockUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        user.isBlocked = false;
        await this.userRepository.save(user);
        return true;
    }

    async updateRoles(id: number, roles: string[]) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        user.roles = roles.map(r => r as UserRole);
        await this.userRepository.save(user);
        return true;
    }

    async changePassword(id: number, currentPassword: string, newPassword: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'password'],
        });

        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new ApiError('Contraseña actual incorrecta', HttpStatus.UNAUTHORIZED);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);
        return true;
    }
}
