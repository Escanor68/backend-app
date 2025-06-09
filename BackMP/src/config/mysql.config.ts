import dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

// Configuración específica para MySQL
export const mysqlConfig: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'backmp',
    charset: 'utf8mb4',
    extra: {
        charset: 'utf8mb4',
    },
};

// Configuración completa incluyendo MySQL
export const configWithMySQL = {
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

    // Configuración de MySQL
    database: mysqlConfig,

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
