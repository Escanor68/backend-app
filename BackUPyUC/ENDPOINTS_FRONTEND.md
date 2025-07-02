# Endpoints Configurados para Frontend

## Configuración CORS

El backend está configurado para permitir peticiones desde:

-   `http://localhost:3000`
-   `http://localhost:4000`

## Endpoints Disponibles

### 1. GET /api/auth/me

**Descripción:** Obtiene la información del usuario autenticado

**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**

```json
{
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Nombre Apellido",
    "roles": ["user"],
    "createdAt": "2024-06-07T12:00:00.000Z",
    "updatedAt": "2024-06-07T12:00:00.000Z"
}
```

**Respuesta de error (401):**

```json
{
    "message": "Usuario no autenticado"
}
```

### 2. GET /api/users/notifications

**Descripción:** Obtiene las notificaciones del usuario autenticado

**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**

```json
[
    {
        "id": "1",
        "message": "Tu reserva ha sido confirmada",
        "read": false,
        "createdAt": "2024-06-07T12:00:00.000Z"
    },
    {
        "id": "2",
        "message": "Nuevo campo disponible",
        "read": true,
        "createdAt": "2024-06-06T10:30:00.000Z"
    }
]
```

**Respuesta de error (401):**

```json
{
    "message": "Usuario no autenticado"
}
```

### 3. GET /api/users/favorite-fields

**Descripción:** Obtiene los IDs de los campos favoritos del usuario

**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**

```json
["1", "2", "3"]
```

**Respuesta de error (401):**

```json
{
    "message": "Usuario no autenticado"
}
```

## Endpoints Adicionales Disponibles

### Autenticación

-   `POST /api/auth/login` - Iniciar sesión
-   `POST /api/auth/register` - Registrarse
-   `POST /api/auth/logout` - Cerrar sesión
-   `POST /api/auth/refresh-token` - Refrescar token
-   `POST /api/auth/request-password-reset` - Solicitar reset de contraseña
-   `POST /api/auth/reset-password` - Resetear contraseña
-   `POST /api/auth/change-password` - Cambiar contraseña

### Gestión de Usuario

-   `GET /api/users/profile` - Obtener perfil completo
-   `PUT /api/users/profile` - Actualizar perfil
-   `POST /api/users/favorite-fields` - Agregar campo favorito
-   `DELETE /api/users/favorite-fields/:fieldId` - Eliminar campo favorito
-   `PUT /api/users/notifications/:id/read` - Marcar notificación como leída

## Ejemplos de Uso con cURL

### Obtener usuario autenticado

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Obtener notificaciones

```bash
curl -X GET http://localhost:3001/api/users/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Obtener campos favoritos

```bash
curl -X GET http://localhost:3001/api/users/favorite-fields \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Notas Importantes

1. **Autenticación:** Todos los endpoints protegidos requieren un token JWT válido en el header `Authorization`
2. **CORS:** El backend está configurado para permitir peticiones desde `localhost:4000`
3. **Estructura de Respuesta:** Los endpoints devuelven exactamente la estructura que espera el frontend
4. **IDs como Strings:** Los IDs se devuelven como strings para compatibilidad con el frontend
5. **Manejo de Errores:** Todos los endpoints incluyen manejo de errores consistente

## Estado del Servidor

Para verificar que el servidor esté funcionando:

```bash
curl http://localhost:3001/health
```

Respuesta esperada:

```json
{
    "status": "OK",
    "timestamp": "2024-06-07T12:00:00.000Z",
    "uptime": 123.456
}
```
