# BackUPyUC - Microservicio de Gestión de Usuarios

Este microservicio se encarga de la gestión de usuarios, incluyendo autenticación, autorización, recuperación de contraseña y auditoría de acciones.

## Características

- Registro y autenticación de usuarios
- Gestión de roles y permisos
- Recuperación de contraseña
- Auditoría de acciones
- Validación de datos
- Seguridad mejorada
- Documentación de API

## Requisitos

- Node.js >= 14
- PostgreSQL >= 12
- npm o yarn

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/your-username/backupyuc.git
cd backupyuc
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar la base de datos:

```bash
# Asegúrate de tener PostgreSQL corriendo
```

5. Ejecutar migraciones:

```bash
npm run migration:run
```

## Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# Ejecutar tests
npm test

# Linting
npm run lint
```

## Producción

```bash
# Construir
npm run build

# Iniciar
npm start
```

## Estructura del Proyecto

```
src/
├── api/
│   ├── controllers/
│   ├── services/
│   └── repositories/
├── config/
├── core/
│   ├── constants/
│   ├── errors/
│   └── interfaces/
├── middleware/
├── models/
├── routes/
├── utils/
├── app.ts
└── server.ts
```

## API Endpoints

### Usuarios

- `POST /api/users/register` - Registro de usuario
- `POST /api/users/login` - Inicio de sesión
- `POST /api/users/password-reset` - Solicitar recuperación de contraseña
- `PUT /api/users/password-reset/:token` - Restablecer contraseña
- `GET /api/users/profile` - Obtener perfil de usuario
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/password` - Cambiar contraseña

### Administración

- `GET /api/users` - Listar usuarios (admin)
- `PUT /api/users/:id/block` - Bloquear usuario (admin)
- `PUT /api/users/:id/role` - Actualizar rol (admin)

## Seguridad

- Autenticación JWT
- Bcrypt para hash de contraseñas
- Rate limiting
- CORS configurado
- Helmet para headers de seguridad
- Validación de datos
- Auditoría de acciones

## Contribución

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
