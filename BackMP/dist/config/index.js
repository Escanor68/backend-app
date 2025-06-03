"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    jwt: {
        secret: process.env.JWT_SECRET || 'tu-secreto-seguro-temporal',
        expiresIn: '1h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'tu-refresh-secreto-temporal',
        refreshExpiresIn: '7d',
    },
    mercadopago: {
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
        publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
    },
    server: {
        port: process.env.PORT || 3000,
    },
    database: {
        url: process.env.DATABASE_URL || 'tu-url-de-base-de-datos',
    },
    port: process.env.PORT || 3003,
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
    },
    // Configuración de JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
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
//# sourceMappingURL=index.js.map