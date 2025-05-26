# BackFutbol

Backend para aplicación de gestión de fútbol.

## Requisitos

- Node.js (v16 o superior)
- MySQL/MariaDB

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Escanor68/backend-app.git
cd backend-app/BackFutbol
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

## Características

- Autenticación JWT
- Validación de datos con Joi
- Base de datos MySQL con TypeORM
- Documentación API con Swagger
- Tests con Jest
- Socket.IO para comunicación en tiempo real
- Envío de emails con Nodemailer
- Docker support

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

## Licencia

ISC - Ver [LICENSE](LICENSE) para más detalles.
