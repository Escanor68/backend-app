import { soccerFieldRepository as soccerFieldRepositoryImport } from '../datasource/mysql.datasource';
import { FutbolRepository } from './Futbol.repository';

export const soccerFieldRepository = new FutbolRepository(
    soccerFieldRepositoryImport,
);
