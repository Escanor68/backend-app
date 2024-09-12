import { Router } from 'express';
import LivenessController from '../api/controllers/Liveness.controller';
import ReadinessController from '../api/controllers/Readiness.controller';
const router = Router();

router.get(`/hola-mundo`, ReadinessController);
router.get(`/readiness`, ReadinessController);
router.get(`/liveness`, LivenessController);
router.get(`/`, LivenessController);

export default router;
