import {
  initializeTransactionalContext,
  addTransactionalDataSource,
} from 'typeorm-transactional';
import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import dotenv from 'dotenv';
import { UserPlayerEntity } from '../../core/entities/UserPlayer.entity';
import { UserFieldEntity } from '../../core/entities/UserField.entity';
import { MercadoPagoEntity } from '../../core/entities/MercadoPago.entity';

// Configuración de las variables de entorno
dotenv.config();

// Clase para la fuente de datos de MySQL
class MySql extends DataSource {
  static isInitialized = false;
}

// Creación de una nueva fuente de datos utilizando los valores de las variables de entorno
const ds = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE as string,
  entities: [UserPlayerEntity, UserFieldEntity, MercadoPagoEntity], // Entidades que serán utilizadas por la conexión
  synchronize: false, // No sincronizar la estructura de la base de datos automáticamente
  logging: false, // No habilitar el registro de consultas en la consola
});

// Inicialización del contexto transaccional y agregación de la fuente de datos transaccional
initializeTransactionalContext();
const mysqlDs = addTransactionalDataSource(ds);
export default mysqlDs;

// Obtención del repositorio de usuarios a partir de la fuente de datos transaccional
const userPlayerRepository: Repository<UserPlayerEntity> =
  mysqlDs.getRepository(UserPlayerEntity);

// Obtención del repositorio de usuarios a partir de la fuente de datos transaccional
const userFieldRepository: Repository<UserFieldEntity> =
  mysqlDs.getRepository(UserFieldEntity);

// Obtención del repositorio de usuarios a partir de la fuente de datos transaccional
const mercadoPagoRepository: Repository<MercadoPagoEntity> =
  mysqlDs.getRepository(MercadoPagoEntity);

// Exportación de la clase MySql y el repositorio de usuarios
export {
  MySql,
  userPlayerRepository,
  userFieldRepository,
  mercadoPagoRepository,
};
