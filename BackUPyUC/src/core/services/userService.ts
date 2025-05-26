import { getRepository } from 'typeorm';
import { User } from '../entities/User.entity';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export class UserService {
    private static readonly userRepository = getRepository(User);

    public static async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    public static async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    public static async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    public static async update(id: string, userData: Partial<User>): Promise<User> {
        await this.userRepository.update(id, userData);
        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return updatedUser;
    }

    public static async delete(id: string): Promise<void> {
        await this.userRepository.delete(id);
    }

    public static async verifyEmail(token: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { verificationToken: token } });
        if (!user) {
            throw new UnauthorizedError('Invalid verification token');
        }

        user.isVerified = true;
        user.verificationToken = null;
        return this.userRepository.save(user);
    }

    public static async setResetPasswordToken(email: string): Promise<string> {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const token = Math.random().toString(36).substring(2, 15);
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Token válido por 1 hora

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await this.userRepository.save(user);

        return token;
    }

    public static async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: MoreThan(new Date())
            }
        });

        if (!user) {
            throw new UnauthorizedError('Invalid or expired reset token');
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.userRepository.save(user);
    }

    public static async updateLastLogin(id: string): Promise<void> {
        await this.userRepository.update(id, {
            lastLogin: new Date()
        });
    }
} 