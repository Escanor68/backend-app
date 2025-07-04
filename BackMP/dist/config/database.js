"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
exports.setupDatabase = setupDatabase;
const typeorm_1 = require("typeorm");
const index_1 = require("./index");
const mysql_config_1 = require("./mysql.config");
console.log('📦 [Database] Configurando conexión a base de datos...');
// Crear la conexión a la base de datos
exports.AppDataSource = new typeorm_1.DataSource({
    ...mysql_config_1.mysqlConfig,
    entities: ['dist/models/**/*.model.js'],
    migrations: ['dist/migrations/*.js'],
    synchronize: false, // Desactivar sincronización automática para evitar conflictos
    logging: index_1.config.nodeEnv === 'development',
});
// Inicializar la conexión
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log('✅ [Database] Conexión a la base de datos establecida');
    }
    catch (error) {
        console.error('❌ [Database] Error al conectar con la base de datos:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
async function setupDatabase() {
    try {
        await exports.AppDataSource.initialize();
        console.log('Base de datos conectada');
    }
    catch (error) {
        console.error('Error al conectar la base de datos:', error);
        process.exit(1);
    }
}
//# sourceMappingURL=database.js.map