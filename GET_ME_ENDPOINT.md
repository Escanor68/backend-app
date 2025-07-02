# Endpoint GET /api/auth/me

## Descripción

Este endpoint permite obtener la información del usuario autenticado actualmente.

## URL

```
GET /api/auth/me
```

## Headers Requeridos

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## Parámetros

No requiere parámetros en el body ni en la URL.

## Respuesta Exitosa (200 OK)

```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "name": "Nombre Apellido",
  "phone": "+34612345678",
  "roles": ["user"],
  "preferredLocation": {
    "lat": 40.4168,
    "lng": -3.7038
  },
  "notificationPreferences": {
    "email": true,
    "push": true,
    "sms": false
  },
  "isBlocked": false,
  "createdAt": "2024-06-07T12:00:00.000Z",
  "updatedAt": "2024-06-07T12:00:00.000Z"
}
```

## Respuesta de Error (401 Unauthorized)

```json
{
  "message": "Usuario no autenticado"
}
```

## Respuesta de Error (401 Unauthorized) - Token inválido

```json
{
  "message": "Token inválido o expirado"
}
```

## Respuesta de Error (500 Internal Server Error)

```json
{
  "message": "Error interno del servidor"
}
```

## Ejemplo de Uso con cURL

```bash
curl -X GET "http://localhost:3000/api/v1/auth/me" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "Content-Type: application/json"
```

## Ejemplo de Uso con JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/me', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
});

if (response.ok) {
  const userData = await response.json();
  console.log('Usuario:', userData);
} else {
  const error = await response.json();
  console.error('Error:', error.message);
}
```

## Implementación Técnica

### Ruta

- **Archivo**: `src/routes/auth.routes.ts`
- **Línea**: `router.get('/me', authMiddleware, authController.getProfile.bind(authController));`

### Controlador

- **Archivo**: `src/api/controllers/auth.controller.ts`
- **Método**: `getProfile(req: AuthenticatedRequest, res: Response)`

### Servicio

- **Archivo**: `src/api/services/auth.service.ts`
- **Método**: `getProfile(userId: number): Promise<UserData>`

### Middleware

- **Archivo**: `src/middleware/auth.middleware.ts`
- **Función**: `authMiddleware`

## Seguridad

- ✅ Requiere autenticación JWT
- ✅ Valida que el token sea válido y no esté expirado
- ✅ Verifica que el usuario no esté bloqueado
- ✅ No expone información sensible como contraseñas

## Campos de Respuesta

| Campo                     | Tipo              | Descripción                              |
| ------------------------- | ----------------- | ---------------------------------------- |
| `id`                      | number            | ID único del usuario                     |
| `email`                   | string            | Email del usuario                        |
| `name`                    | string            | Nombre completo del usuario              |
| `phone`                   | string (opcional) | Número de teléfono                       |
| `roles`                   | string[]          | Roles del usuario (user, admin, manager) |
| `preferredLocation`       | object (opcional) | Ubicación preferida del usuario          |
| `notificationPreferences` | object            | Preferencias de notificación             |
| `isBlocked`               | boolean           | Indica si el usuario está bloqueado      |
| `createdAt`               | string            | Fecha de creación (ISO 8601)             |
| `updatedAt`               | string            | Fecha de última actualización (ISO 8601) |

## Notas

- Este endpoint es idéntico en funcionalidad al endpoint `/api/users/profile`
- La diferencia principal es la ruta: `/api/auth/me` vs `/api/users/profile`
- Ambos endpoints devuelven la misma información del usuario autenticado
- Se recomienda usar `/api/auth/me` para consistencia con convenciones REST
