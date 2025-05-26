import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { User } from '../entities/User.entity';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export class AuthService {
    private static readonly userRepository = getRepository(User);

    static async login(email: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        };
    }

    static async register(userData: Partial<User>) {
        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password!, 10);
        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
            role: 'user' // Default role
        });

        await this.userRepository.save(user);

        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        };
    }

    private static generateToken(user: User): string {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );
    }

    static async validateToken(token: string) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (error) {
            throw new UnauthorizedError('Invalid token');
        }
    }

    static async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await bcrypt.compare(oldPassword, user.password);

        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid current password');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
    }
} 