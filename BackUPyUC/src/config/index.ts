import { DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export interface Config {
    port: number;
    jwtSecret: string;
    database: DataSourceOptions;
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
    cors: {
        origin: string[];
        credentials: boolean;
    };
    frontendUrl: string;
    jwt: {
        secret: string;
        refreshSecret: string;
        accessExpiration: string;
        refreshExpiration: string;
    };
}

const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    database: {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'backupyuc',
        entities: ['src/entities/**/*.ts'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production',
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || '',
        },
        from: process.env.EMAIL_FROM || 'noreply@backupyuc.com',
    },
    cors: {
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',')
            : ['http://localhost:3000'],
        credentials: true,
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '1h',
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
};

export default config;
