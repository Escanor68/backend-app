import { DataSource } from 'typeorm';
import { config } from './index';
import { mysqlConfig } from './mysql.config';

console.log('📦 [Database] Configurando conexión a base de datos...');

// Crear la conexión a la base de datos
export const AppDataSource = new DataSource({
    ...mysqlConfig,
    entities: ['src/models/**/*.model.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: config.nodeEnv !== 'production',
    logging: config.nodeEnv === 'development',
});

// Inicializar la conexión
export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ [Database] Conexión a la base de datos establecida');
    } catch (error) {
        console.error(
            '❌ [Database] Error al conectar con la base de datos:',
            error,
        );
        throw error;
    }
};

export async function setupDatabase() {
    try {
        await AppDataSource.initialize();
        console.log('Base de datos conectada');
    } catch (error) {
        console.error('Error al conectar la base de datos:', error);
        process.exit(1);
    }
}
