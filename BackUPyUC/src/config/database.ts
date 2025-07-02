import { DataSource } from 'typeorm';
import { config } from './index';
import { mysqlConfig } from './mysql.config';
import { User } from '../models/user.model';
import { PasswordResetToken } from '../models/password-reset-token.model';
import { AuditLog } from '../models/audit-log.model';
import { BlacklistedToken } from '../models/blacklisted-token.model';

console.log('📦 [Database] Configurando conexión a base de datos...');

// Crear la conexión a la base de datos
export const AppDataSource = new DataSource({
    ...mysqlConfig,
    entities: [User, PasswordResetToken, AuditLog, BlacklistedToken],
    migrations: ['src/migrations/*.ts'],
    synchronize: false, // Deshabilitado para evitar conflictos con columnas existentes
    logging: config.server.nodeEnv === 'development',
});

// Inicializar la conexión
export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ [Database] Conexión a la base de datos establecida');
    } catch (error) {
        console.error('❌ [Database] Error al conectar con la base de datos:', error);
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
