# Configuración para Frontend

## 🎯 Resumen de Cambios Implementados

Tu backend está ahora completamente configurado para trabajar con tu frontend que corre en `http://localhost:4000`. El BackUPyUC correrá en el puerto 3001. Se han implementado todos los cambios solicitados:

### ✅ 1. Configuración CORS Actualizada

-   Permitir peticiones desde `http://localhost:3001` y `http://localhost:4000`
-   Headers configurados para autenticación JWT
-   Credenciales habilitadas

### ✅ 2. Endpoints Configurados

#### GET /api/auth/me

**URL:** `http://localhost:3001/api/auth/me`  
**Método:** GET  
**Headers:** `Authorization: Bearer <token>`  
**Respuesta:**

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

#### GET /api/users/notifications

**URL:** `http://localhost:3001/api/users/notifications`  
**Método:** GET  
**Headers:** `Authorization: Bearer <token>`  
**Respuesta:**

```json
[
    {
        "id": "1",
        "message": "Tu reserva ha sido confirmada",
        "read": false,
        "createdAt": "2024-06-07T12:00:00.000Z"
    }
]
```

#### GET /api/users/favorite-fields

**URL:** `http://localhost:3001/api/users/favorite-fields`  
**Método:** GET  
**Headers:** `Authorization: Bearer <token>`  
**Respuesta:**

```json
["1", "2", "3"]
```

## 🚀 Cómo Usar en tu Frontend

### 1. Configuración Base

```javascript
const API_BASE_URL = 'http://localhost:3001';

const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // token obtenido del login
};
```

### 2. Ejemplo de Uso con Fetch

```javascript
// Obtener usuario autenticado
async function getCurrentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            console.log('Usuario:', user);
            return user;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Obtener notificaciones
async function getNotifications() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/notifications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const notifications = await response.json();
            console.log('Notificaciones:', notifications);
            return notifications;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Obtener campos favoritos
async function getFavoriteFields() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/favorite-fields`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const favoriteFields = await response.json();
            console.log('Campos favoritos:', favoriteFields);
            return favoriteFields;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### 3. Ejemplo con Axios

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Funciones de API
export const authAPI = {
    getCurrentUser: () => api.get('/api/auth/me'),
    login: credentials => api.post('/api/auth/login', credentials),
    register: userData => api.post('/api/auth/register', userData),
};

export const userAPI = {
    getNotifications: () => api.get('/api/users/notifications'),
    getFavoriteFields: () => api.get('/api/users/favorite-fields'),
    addFavoriteField: fieldId => api.post('/api/users/favorite-fields', { fieldId }),
    removeFavoriteField: fieldId => api.delete(`/api/users/favorite-fields/${fieldId}`),
};
```

## 🧪 Probar la Configuración

### 1. Verificar que el servidor esté corriendo

```bash
curl http://localhost:3001/health
```

### 2. Ejecutar el script de pruebas

```bash
cd BackUPyUC
./test-frontend-endpoints.sh
```

### 3. Probar CORS manualmente

```bash
curl -X OPTIONS http://localhost:3001/api/auth/me \
  -H "Origin: http://localhost:4000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```

## 📋 Checklist de Verificación

-   [ ] Servidor corriendo en puerto 3000
-   [ ] CORS configurado para localhost:4000
-   [ ] Endpoint `/api/auth/me` devuelve estructura correcta
-   [ ] Endpoint `/api/users/notifications` devuelve array con estructura correcta
-   [ ] Endpoint `/api/users/favorite-fields` devuelve array de IDs como strings
-   [ ] Autenticación JWT funcionando
-   [ ] Headers de autorización configurados correctamente

## 🔧 Solución de Problemas

### Error de CORS

Si ves errores de CORS en el navegador:

1. Verifica que el servidor esté corriendo en puerto 3001
2. Confirma que la configuración CORS incluya `http://localhost:4000`
3. Revisa que las peticiones incluyan el header `Authorization`

### Error 401 (No autorizado)

1. Verifica que el token JWT sea válido
2. Confirma que el token no haya expirado
3. Asegúrate de incluir el header `Authorization: Bearer <token>`

### Error 500 (Error interno)

1. Revisa los logs del servidor
2. Verifica que la base de datos esté conectada
3. Confirma que todas las dependencias estén instaladas

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs del servidor
2. Ejecuta el script de pruebas
3. Verifica la documentación en `ENDPOINTS_FRONTEND.md`
4. Consulta los comandos cURL en `curl-commands.md`

¡Tu backend está listo para trabajar con tu frontend! 🎉
