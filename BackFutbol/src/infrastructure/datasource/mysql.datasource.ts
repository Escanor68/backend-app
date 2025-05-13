import {
    initializeTransactionalContext,
    addTransactionalDataSource,
} from 'typeorm-transactional';
import 'reflect-metadata';
import { DataSource, Repository } from 'typeorm';
import { SoccerFieldEntities } from '../../core/entities/Futbol.entity';
import dotenv from 'dotenv';

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
    entities: [SoccerFieldEntities],
    synchronize: false,
    logging: false,
});

initializeTransactionalContext();
const mysqlDs = addTransactionalDataSource(ds);
export default mysqlDs;

const soccerFieldRepository: Repository<SoccerFieldEntities> =
    mysqlDs.getRepository(SoccerFieldEntities);

export { MySql, soccerFieldRepository };
