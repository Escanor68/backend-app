import { DataSource } from 'typeorm';
import { config } from './index';

export const AppDataSource = new DataSource(config.database); 