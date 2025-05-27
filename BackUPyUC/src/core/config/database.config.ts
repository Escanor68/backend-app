import { ConnectionOptions } from 'typeorm';
import { config } from './config';

const databaseConfig: ConnectionOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: ['src/core/entities/**/*.ts'],
  migrations: ['src/core/database/migrations/**/*.ts'],
  cli: {
    migrationsDir: 'src/core/database/migrations'
  },
  synchronize: false, // Deshabilitado en producción
  logging: config.database.logging
};

export default databaseConfig; 