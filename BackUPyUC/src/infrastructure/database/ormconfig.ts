import { DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const ormconfig: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'upyuc_db',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    entities: ['src/core/entities/**/*.ts'],
    migrations: ['src/infrastructure/database/migrations/**/*.ts'],
    subscribers: ['src/infrastructure/database/subscribers/**/*.ts'],
    cli: {
        entitiesDir: 'src/core/entities',
        migrationsDir: 'src/infrastructure/database/migrations',
        subscribersDir: 'src/infrastructure/database/subscribers'
    }
}; 