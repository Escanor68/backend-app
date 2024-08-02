import {
    initializeTransactionalContext,
    addTransactionalDataSource,
} from 'typeorm-transactional';
import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import dotenv from 'dotenv';
import { UserPlayerEntity } from '../../core/entities/UserPlayer.entity';
//import { UserFieldEntity } from '../../core/entities/UserField.entity';
//import { MercadoPagoEntity } from '../../core/entities/MercadoPago.entity';

dotenv.config();

class MySql extends DataSource {
    static isInitialized = false;
}

const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE as string,
    entities: [UserPlayerEntity /*, UserFieldEntity, MercadoPagoEntity*/],
    synchronize: false,
    logging: false,
});

initializeTransactionalContext();
const mysqlDs = addTransactionalDataSource(ds);
export default mysqlDs;

const userPlayerRepository: Repository<UserPlayerEntity> =
    mysqlDs.getRepository(UserPlayerEntity);

/*// Obtención del repositorio de usuarios a partir de la fuente de datos transaccional
const userFieldRepository: Repository<UserFieldEntity> =
    mysqlDs.getRepository(UserFieldEntity);

const mercadoPagoRepository: Repository<MercadoPagoEntity> =
    mysqlDs.getRepository(MercadoPagoEntity);*/

export {
    MySql,
    userPlayerRepository,
    //userFieldRepository,
    //mercadoPagoRepository,
};
