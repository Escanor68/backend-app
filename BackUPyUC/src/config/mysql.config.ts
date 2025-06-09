import { DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 [MySQL Config] Configurando conexión MySQL...');

if (
    !process.env.DB_HOST ||
    !process.env.DB_USERNAME ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_NAME
) {
    throw new Error(
        '❌ [MySQL Config] Faltan variables de entorno requeridas para la conexión a la base de datos'
    );
}

// Configuración específica para MySQL con mysql2 (compatible con TypeORM)
export const mysqlConfig: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    entities: ['src/models/**/*.model.ts'],
    migrations: ['src/migrations/*.ts'],
    // Configuraciones específicas de MySQL
    extra: {
        charset: 'utf8mb4',
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    },
    // Configuración para caracteres Unicode
    charset: 'utf8mb4',
};

console.log('✅ [MySQL Config] Configuración MySQL creada:', {
    type: mysqlConfig.type,
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    database: mysqlConfig.database,
});

// Configuración completa incluyendo MySQL
export const configWithMySQL = {
    // Configuración del servidor
    server: {
        port: process.env.PORT || 3001,
        nodeEnv: process.env.NODE_ENV || 'development',
    },

    // Configuración de MySQL
    database: mysqlConfig,

    // Configuración de JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
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
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
};
