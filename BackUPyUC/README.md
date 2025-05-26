# BackUPyUC

Backend para aplicación de gestión de UPyUC.

## Requisitos

- Node.js (v16 o superior)
- MySQL/MariaDB

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Escanor68/backend-app.git
cd backend-app/BackUPyUC
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.sample .env
# Editar .env con tus configuraciones
```

## Scripts Disponibles

- `npm start` - Inicia la aplicación en modo producción
- `npm run dev` - Inicia la aplicación en modo desarrollo con hot-reload
- `npm run dev:dist` - Inicia la aplicación en modo desarrollo desde la distribución
- `npm test` - Ejecuta las pruebas
- `npm run build` - Compila el proyecto
- `npm run lint` - Ejecuta el linter
- `npm run format` - Formatea el código

## Características

- Autenticación JWT
- Validación de datos con Joi
- Base de datos MySQL con TypeORM
- Documentación API con Swagger
- Tests con Jest
- Socket.IO para comunicación en tiempo real
- Envío de emails con Nodemailer
- Docker support
- Rate limiting para protección contra ataques
- Compresión de respuestas
- Manejo de CORS configurable
- Health check endpoints

## Estructura del Proyecto

```
src/
├── api/         # Controladores y rutas de la API
├── core/        # Lógica de negocio y modelos
├── infrastructure/  # Configuración de infraestructura
├── middleware/  # Middlewares de Express
├── routes/      # Definición de rutas
└── test/        # Tests
```

## Seguridad

- Protección contra ataques DoS con rate limiting
- Headers de seguridad con Helmet
- Validación de datos en todas las rutas
- Sanitización de entradas
- CORS configurable
- Límites en tamaño de payload

## Licencia

ISC - Ver [LICENSE](LICENSE) para más detalles.
