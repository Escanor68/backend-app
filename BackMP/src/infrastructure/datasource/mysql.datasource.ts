import {
    initializeTransactionalContext,
    addTransactionalDataSource,
} from 'typeorm-transactional';
import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import dotenv from 'dotenv';
import { TransactionEntity } from '../../core/entitie/MercadoPago.entity';

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
    entities: [TransactionEntity],
    synchronize: false,
    logging: false,
});

initializeTransactionalContext();
const mysqlDs = addTransactionalDataSource(ds);
export default mysqlDs;

const transactionRepository: Repository<TransactionEntity> =
    mysqlDs.getRepository(TransactionEntity);

export { MySql, transactionRepository };
