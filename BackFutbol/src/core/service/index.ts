import { FutbolService } from './Futbol.service';
import { soccerFieldRepository } from '../../infrastructure/repositories';

export const futbolService = new FutbolService(soccerFieldRepository);
