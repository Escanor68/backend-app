// Importar el módulo Router de Express y los controladores necesarios
import { Router } from 'express';
import LivenessController from '../api/controller/Liveness.controller';
import ReadinessController from '../api/controller/Readiness.controller';

// Crear un nuevo enrutador
const router = Router();

// Definir las rutas y asociarlas con los controladores correspondientes
router.get(`/hola-mundo`, ReadinessController); // Ruta "/hola-mundo" asociada al controlador de readiness
router.get(`/readiness`, ReadinessController); // Ruta "/readiness" asociada al controlador de readiness
router.get(`/liveness`, LivenessController); // Ruta "/liveness" asociada al controlador de liveness
router.get(`/`, LivenessController); // Ruta "/" asociada al controlador de liveness

// Exportar el enrutador para que pueda ser utilizado en otros archivos
export default router;
