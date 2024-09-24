import { Router } from 'express';
import { futbolController } from '../api/controller';
const router = Router({ mergeParams: true });

router.post(`/api/v1/futbol/crearCancha`, futbolController.crearTurnos);
router.get(`/api/v1/futbol/traerCanchas`, futbolController.traerCanchas);

export default router;
