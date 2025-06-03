import { DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Configuración del servidor
    server: {
        port: process.env.PORT || 3001,
        nodeEnv: process.env.NODE_ENV || 'development',
    },

    // Configuración de la base de datos
    database: {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'backupyuc',
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        entities: ['src/models/**/*.model.ts'],
        migrations: ['src/migrations/*.ts'],
    } as DataSourceOptions,

    // Configuración de JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'tu-secreto-seguro-temporal',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshSecret:
            process.env.JWT_REFRESH_SECRET || 'tu-refresh-secreto-temporal',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    // Configuración de CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },

    // Configuración de Email
    email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    },

    // Configuración de Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // límite de 100 solicitudes por ventana
    },
};
