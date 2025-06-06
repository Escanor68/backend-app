import { AppDataSource } from '../../config/database';
import { User } from '../../models/user.model';
import { ApiError } from '../utils/api-error';
import { HttpStatus } from '../utils/http-status';
import bcrypt from 'bcrypt';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(userData: any) {
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
            roles: ['user'],
        });

        await this.userRepository.save(user);
        return user;
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return null;
        }
        Object.assign(user, userData);
        return this.userRepository.save(user);
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async blockUser(id: string) {
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

    async unblockUser(id: string) {
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

    async updateRoles(id: string, roles: string[]) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        user.roles = roles;
        await this.userRepository.save(user);
        return true;
    }

    async changePassword(id: string, currentPassword: string, newPassword: string) {
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
