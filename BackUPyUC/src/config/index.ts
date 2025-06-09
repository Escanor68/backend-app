import dotenvConfig from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenvConfig.config();

interface Config {
    server: {
        port: number;
        nodeEnv: string;
    };
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
        options: SignOptions;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
        from: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    mercadoPago: {
        accessToken: string;
        publicKey: string;
        webhookSecret: string;
    };
    frontendUrl: string;
}

export const config: Config = {
    server: {
        port: parseInt(process.env.PORT || '3000'),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'turnosya_db',
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
        refreshSecret: process.env.JWT_REFRESH_SECRET || '',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        options: {
            expiresIn: '24h',
        },
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        credentials: true,
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || '',
        },
        from: process.env.EMAIL_FROM || 'noreply@backupyuc.com',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
    mercadoPago: {
        accessToken: process.env.MP_ACCESS_TOKEN || '',
        publicKey: process.env.MP_PUBLIC_KEY || '',
        webhookSecret: process.env.MP_WEBHOOK_SECRET || '',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
