import { DataSource } from 'typeorm';
import config from './index';

console.log('📦 [Database] Configurando conexión a base de datos...');

// Crear la configuración de la base de datos con casting seguro
const dbConfig = config.database;

export const AppDataSource = new DataSource(config.database);

export const setupDatabase = async (): Promise<void> => {
    try {
        console.log('🔄 [Database] Iniciando conexión a base de datos...');
        console.log('📊 [Database] Configuración:', {
            type: dbConfig.type,
            host: (dbConfig as any).host,
            port: (dbConfig as any).port,
            database: (dbConfig as any).database,
            synchronize: dbConfig.synchronize,
            logging: dbConfig.logging,
        });

        await AppDataSource.initialize();

        console.log('✅ [Database] Conexión a base de datos establecida exitosamente');
        console.log('📊 [Database] Estado de la conexión:', {
            isInitialized: AppDataSource.isInitialized,
            options: {
                database: AppDataSource.options.database,
                synchronize: AppDataSource.options.synchronize,
            },
        });

        // Verificar si hay migraciones pendientes
        if (AppDataSource.options.synchronize) {
            console.log('🔄 [Database] Sincronización automática habilitada');
        } else {
            console.log('📋 [Database] Verificando migraciones pendientes...');
            const pendingMigrations = await AppDataSource.showMigrations();
            if (pendingMigrations) {
                console.log('⚠️ [Database] Hay migraciones pendientes que deben ejecutarse');
            } else {
                console.log('✅ [Database] Base de datos actualizada');
            }
        }
    } catch (error) {
        console.error('❌ [Database] Error al conectar con la base de datos:', error);
        console.error('❌ [Database] Stack trace:', (error as Error).stack);

        // Información adicional para debugging
        console.error('📊 [Database] Configuración utilizada:', {
            host: (dbConfig as any).host,
            port: (dbConfig as any).port,
            database: (dbConfig as any).database,
            username: (dbConfig as any).username ? '***' : 'undefined',
        });

        throw error;
    }
};
