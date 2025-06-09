import jwt from 'jsonwebtoken';
import { config } from '../config';
import { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
    userId: number;
}

export const generateToken = (userId: number, options?: SignOptions): string => {
    const payload: TokenPayload = { userId };
    return jwt.sign(payload, config.jwt.secret, {
        ...config.jwt.options,
        ...options,
    });
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};
