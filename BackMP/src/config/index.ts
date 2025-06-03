import dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

export const config = {
    port: process.env.PORT || 3003,

    // Configuración de JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshSecret:
            process.env.JWT_REFRESH_SECRET || 'tu-refresh-secreto-temporal',
        refreshExpiresIn: '7d',
    },

    // Configuración de MercadoPago
    mercadoPago: {
        accessToken: process.env.MP_ACCESS_TOKEN,
        publicKey: process.env.MP_PUBLIC_KEY,
    },

    // Configuración de la base de datos
    database: {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'backmp',
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        entities: ['src/models/**/*.model.ts'],
    } as DataSourceOptions,

    // Configuración de CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },

    // Configuración de Socket.IO
    socket: {
        cors: {
            origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
        },
    },
};
