// Importar el módulo Router de Express y el controlador de usuarios
import { Router } from 'express';
import { userPlayerController } from '../api/controller/';

// Crear un nuevo enrutador con la opción mergeParams establecida en true
const router = Router({ mergeParams: true });

// Definir las rutas y asociarlas con las funciones del controlador de usuarios correspondientes
router.get(`/api/v1/get/name`, userPlayerController.getName); // Ruta para obtener un usuario por Name

// Exportar el enrutador para que pueda ser utilizado en otros archivos
export default router;
