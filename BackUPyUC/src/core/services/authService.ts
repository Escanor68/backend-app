import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export interface UserCredentials {
    email: string;
    password: string;
}

export interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

export class AuthService {
    private static readonly SALT_ROUNDS = 10;

    public static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    public static async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    public static generateToken(payload: TokenPayload): string {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );
    }

    public static verifyToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;
        } catch (error) {
            throw new UnauthorizedError('Invalid token');
        }
    }

    public static async validateCredentials(credentials: UserCredentials, user: any): Promise<boolean> {
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isValid = await this.comparePasswords(credentials.password, user.password);
        if (!isValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        return true;
    }
} 