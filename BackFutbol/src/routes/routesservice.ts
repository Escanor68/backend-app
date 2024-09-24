import { Router } from 'express';
import { futbolController } from '../api/controller';
const router = Router({ mergeParams: true });

router.post(`/api/v1/futbol/crearCancha`, futbolController.crearTurnos);

export default router;
