import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración global para los tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRATION = '1h';
process.env.JWT_REFRESH_EXPIRATION = '7d';
