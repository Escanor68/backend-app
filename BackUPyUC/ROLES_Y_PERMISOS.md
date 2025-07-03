# Roles y Permisos del Sistema

## Descripción General

El sistema de fútbol implementa un sistema de roles jerárquico que permite diferentes niveles de acceso y funcionalidades según el tipo de usuario.

## Roles Disponibles

### 1. **USER** - Usuario Básico

-   **Descripción**: Usuario básico que puede reservar canchas
-   **Permisos**:
    -   Ver perfil propio
    -   Actualizar perfil propio
    -   Cambiar contraseña
    -   Ver notificaciones
    -   Marcar notificaciones como leídas
-   **Rutas accesibles**: `/profile`, `/notifications`

### 2. **PLAYER** - Jugador

-   **Descripción**: Jugador registrado que puede participar en partidos
-   **Permisos**: Todos los de USER +
    -   Gestionar campos favoritos
    -   Ver campos favoritos
    -   Agregar/quitar campos favoritos
-   **Rutas accesibles**: Todas las de USER + `/favorite-fields`

### 3. **TEAM_CAPTAIN** - Capitán de Equipo

-   **Descripción**: Capitán que puede gestionar equipos
-   **Permisos**: Todos los de PLAYER +
    -   Gestionar equipos
    -   Invitar jugadores
    -   Organizar partidos
-   **Rutas accesibles**: Todas las de PLAYER

### 4. **COACH** - Entrenador

-   **Descripción**: Entrenador que puede gestionar equipos y entrenamientos
-   **Permisos**: Todos los de USER +
    -   Gestionar equipos
    -   Crear planes de entrenamiento
    -   Ver estadísticas de jugadores
-   **Rutas accesibles**: Todas las de USER

### 5. **REFEREE** - Árbitro

-   **Descripción**: Árbitro que puede gestionar partidos
-   **Permisos**: Todos los de USER +
    -   Gestionar partidos
    -   Registrar resultados
    -   Reportar incidentes
-   **Rutas accesibles**: Todas las de USER

### 6. **FIELD_OWNER** - Dueño de Cancha

-   **Descripción**: Dueño de una o más canchas
-   **Permisos**: Todos los de USER +
    -   Gestionar canchas propias
    -   Ver estadísticas de reservas
    -   Gestionar precios
-   **Rutas accesibles**: Todas las de USER

### 7. **FIELD_MANAGER** - Gerente de Cancha

-   **Descripción**: Gerente que administra canchas
-   **Permisos**: Todos los de FIELD_OWNER +
    -   Gestionar reservas
    -   Gestionar personal
    -   Ver reportes financieros
-   **Rutas accesibles**: Todas las de FIELD_OWNER

### 8. **MODERATOR** - Moderador

-   **Descripción**: Moderador del sistema
-   **Permisos**: Todos los de USER +
    -   Moderar contenido
    -   Gestionar reportes
    -   Bloquear usuarios
-   **Rutas accesibles**: Todas las de USER

### 9. **ADMIN** - Administrador

-   **Descripción**: Administrador del sistema
-   **Permisos**: Todos los de MODERATOR +
    -   Gestionar todos los usuarios
    -   Ver todos los datos del sistema
    -   Gestionar configuraciones globales
-   **Rutas accesibles**: Todas las de MODERATOR + `/admin/users`

### 10. **SUPER_ADMIN** - Super Administrador

-   **Descripción**: Super administrador con acceso total
-   **Permisos**: Acceso completo al sistema
-   **Rutas accesibles**: Todas las rutas del sistema

## Jerarquía de Roles

```
SUPER_ADMIN (máximo nivel)
    ↓
ADMIN
    ↓
MODERATOR
    ↓
FIELD_OWNER → FIELD_MANAGER
    ↓
COACH
    ↓
REFEREE
    ↓
TEAM_CAPTAIN
    ↓
PLAYER
    ↓
USER (nivel básico)
```

## Middlewares de Roles

### Middlewares Específicos

```typescript
// Middlewares disponibles
requireSuperAdmin; // Solo SUPER_ADMIN
requireAdmin; // SUPER_ADMIN, ADMIN
requireModerator; // SUPER_ADMIN, ADMIN, MODERATOR
requireFieldOwner; // SUPER_ADMIN, ADMIN, FIELD_OWNER
requireFieldManager; // SUPER_ADMIN, ADMIN, FIELD_OWNER, FIELD_MANAGER
requireCoach; // SUPER_ADMIN, ADMIN, COACH
requireReferee; // SUPER_ADMIN, ADMIN, REFEREE
requireTeamCaptain; // SUPER_ADMIN, ADMIN, TEAM_CAPTAIN
requirePlayer; // SUPER_ADMIN, ADMIN, PLAYER, TEAM_CAPTAIN
requireUser; // Todos los roles
```

### Uso en Rutas

```typescript
// Ejemplo de uso en rutas
router.get('/admin/users', authMiddleware, requireAdmin, userController.getAllUsers);
router.get('/favorite-fields', authMiddleware, requirePlayer, userController.getFavoriteFields);
router.get('/profile', authMiddleware, requireUser, userController.getProfile);
```

## Registro con Roles

### Ejemplo de Registro

```json
{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "123456",
    "phone": "1234567890",
    "roles": ["player", "team_captain"]
}
```

### Roles por Defecto

Si no se especifican roles en el registro, el usuario se crea con el rol `USER` por defecto.

## Comandos de Prueba

### Registrar Usuarios con Diferentes Roles

```bash
# Ejecutar script de prueba de roles
./test-roles.sh
```

### Probar Login y Acceso

```bash
# Ejecutar script de prueba de login
./test-login-roles.sh
```

## Consideraciones de Seguridad

1. **Validación de Roles**: Todos los roles se validan en el backend
2. **Jerarquía**: Los roles superiores tienen acceso a funcionalidades de roles inferiores
3. **Tokens**: Los tokens JWT incluyen información de roles
4. **Middleware**: Cada ruta protegida valida los roles requeridos
5. **Auditoría**: Todas las acciones se registran en el log de auditoría

## Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

1. **Nuevos Roles**: Agregar al enum `UserRole`
2. **Nuevos Middlewares**: Crear middlewares específicos
3. **Nuevas Rutas**: Aplicar middlewares de roles apropiados
4. **Permisos Granulares**: Implementar permisos específicos por acción
