import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { ApiError } from '../core/errors/api.error';
import { HttpStatus } from '../core/constants';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from '../dto/user.dto';
import bcrypt from 'bcrypt';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(userData: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new ApiError('El email ya está registrado', HttpStatus.BAD_REQUEST);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
        });

        return this.userRepository.save(user);
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new ApiError('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        return user;
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.find();
    }

    async updateUser(id: string, updateData: UpdateUserDto): Promise<User> {
        const user = await this.getUserById(id);
        Object.assign(user, updateData);
        return this.userRepository.save(user);
    }

    async updatePassword(id: string, passwordData: UpdatePasswordDto): Promise<User> {
        const user = await this.getUserById(id);

        const isPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new ApiError('Contraseña actual incorrecta', HttpStatus.BAD_REQUEST);
        }

        user.password = await bcrypt.hash(passwordData.newPassword, 10);
        return this.userRepository.save(user);
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.getUserById(id);
        await this.userRepository.remove(user);
    }

    async blockUser(id: string): Promise<User> {
        const user = await this.getUserById(id);
        user.isBlocked = true;
        return this.userRepository.save(user);
    }

    async unblockUser(id: string): Promise<User> {
        const user = await this.getUserById(id);
        user.isBlocked = false;
        return this.userRepository.save(user);
    }

    async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.getUserById(id);

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new ApiError('Contraseña actual incorrecta', HttpStatus.BAD_REQUEST);
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
    }

    async updateRoles(id: string, roles: string[]): Promise<User> {
        const user = await this.getUserById(id);
        user.roles = roles;
        return this.userRepository.save(user);
    }
}
