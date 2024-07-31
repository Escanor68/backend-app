// Importar los módulos necesarios
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Configurar variables de entorno
dotenv.config();

// Importar las rutas
import k8sRoutes from './routes/k8s';
import routesservice from './routes/routesservice';

// Importar controladores de errores
import NotFoundController from './api/controller/NotFound.controller';
import InternalErrorController from './api/controller/InternalError.controller';

// Crear una instancia de la aplicación Express
const app = express();

// Aplicar middlewares de seguridad y procesamiento de datos
app.use(cors()); // Permitir solicitudes de origen cruzado (CORS)
app.use(helmet()); // Añadir cabeceras de seguridad
app.use(express.json()); // Analizar solicitudes con formato JSON
app.use(express.urlencoded({ extended: false })); // Analizar solicitudes con datos codificados en URL

// Asociar las rutas
app.use(k8sRoutes); // Rutas relacionadas con Kubernetes
app.use(routesservice); // Otras rutas de servicios

// Controlador para manejar las solicitudes a rutas no encontradas
app.use(NotFoundController);

// Controlador para manejar errores internos del servidor
app.use(InternalErrorController);

// Iniciar el servidor y escuchar en el puerto especificado en las variables de entorno
app.listen(process.env.PORT, () => {
  console.log(`Api on port ${process.env.PORT}`);
});

// Exportar la aplicación Express para poder usarla en otros archivos
export default app;
