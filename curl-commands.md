# Comandos cURL para probar la API

## Configuración base

```bash
# URL base para BackUPyUC (usuarios y autenticación)
BASE_URL_USERS="http://localhost:3001"

# URL base para BackMP (pagos)
BASE_URL_PAYMENTS="http://localhost:3001"

# Headers comunes
HEADERS="Content-Type: application/json"
```

---

## 🔐 AUTENTICACIÓN Y USUARIOS (BackUPyUC)

### 1. Registro de Usuario

```bash
curl -X POST "${BASE_URL_USERS}/api/users/register" \
  -H "${HEADERS}" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan.perez@ejemplo.com",
    "password": "Password123!",
    "phone": "+34612345678"
  }'
```

### 2. Inicio de Sesión

```bash
curl -X POST "${BASE_URL_USERS}/api/users/login" \
  -H "${HEADERS}" \
  -d '{
    "email": "juan.perez@ejemplo.com",
    "password": "Password123!"
  }'
```

### 3. Recuperar Contraseña

```bash
curl -X POST "${BASE_URL_USERS}/api/users/forgot-password" \
  -H "${HEADERS}" \
  -d '{
    "email": "juan.perez@ejemplo.com"
  }'
```

### 4. Restablecer Contraseña

```bash
curl -X POST "${BASE_URL_USERS}/api/users/reset-password" \
  -H "${HEADERS}" \
  -d '{
    "token": "token_recibido_por_email",
    "newPassword": "NuevaPassword123!"
  }'
```

### 5. Obtener Perfil (requiere autenticación)

```bash
curl -X GET "${BASE_URL_USERS}/api/users/profile" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 6. Actualizar Perfil

```bash
curl -X PUT "${BASE_URL_USERS}/api/users/profile" \
  -H "${HEADERS}" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "name": "Juan Carlos Pérez",
    "phone": "+34612345679"
  }'
```

### 7. Cambiar Contraseña

```bash
curl -X POST "${BASE_URL_USERS}/api/users/change-password" \
  -H "${HEADERS}" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NuevaPassword456!"
  }'
```

---

## 🏟️ CAMPOS FAVORITOS

### 8. Obtener Campos Favoritos

```bash
curl -X GET "${BASE_URL_USERS}/api/users/favorite-fields" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 9. Agregar Campo Favorito

```bash
curl -X POST "${BASE_URL_USERS}/api/users/favorite-fields" \
  -H "${HEADERS}" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "fieldId": 123,
    "fieldName": "Campo Central"
  }'
```

### 10. Eliminar Campo Favorito

```bash
curl -X DELETE "${BASE_URL_USERS}/api/users/favorite-fields/123" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

---

## 🔔 NOTIFICACIONES

### 11. Obtener Notificaciones

```bash
curl -X GET "${BASE_URL_USERS}/api/users/notifications" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 12. Marcar Notificación como Leída

```bash
curl -X PUT "${BASE_URL_USERS}/api/users/notifications/456/read" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

---

## 👨‍💼 ADMINISTRACIÓN (solo para admins)

### 13. Obtener Todos los Usuarios

```bash
curl -X GET "${BASE_URL_USERS}/api/users/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer TOKEN_ADMIN_JWT"
```

### 14. Obtener Usuario por ID

```bash
curl -X GET "${BASE_URL_USERS}/api/users/admin/users/123" \
  -H "Authorization: Bearer TOKEN_ADMIN_JWT"
```

### 15. Actualizar Usuario

```bash
curl -X PUT "${BASE_URL_USERS}/api/users/admin/users/123" \
  -H "${HEADERS}" \
  -H "Authorization: Bearer TOKEN_ADMIN_JWT" \
  -d '{
    "name": "Usuario Actualizado",
    "email": "usuario.actualizado@ejemplo.com",
    "roles": ["user", "premium"]
  }'
```

### 16. Eliminar Usuario

```bash
curl -X DELETE "${BASE_URL_USERS}/api/users/admin/users/123" \
  -H "Authorization: Bearer TOKEN_ADMIN_JWT"
```

---

## 🔐 RUTAS DE AUTENTICACIÓN ALTERNATIVAS

### 17. Registro (ruta alternativa)

```bash
curl -X POST "${BASE_URL_USERS}/api/v1/auth/register" \
  -H "${HEADERS}" \
  -d '{
    "name": "María García",
    "email": "maria.garcia@ejemplo.com",
    "password": "Password123!"
  }'
```

### 18. Login (ruta alternativa)

````bash

### 19. Obtener Usuario Autenticado (GET /api/auth/me)

```bash
curl -X GET "${BASE_URL_USERS}/api/auth/me" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "${HEADERS}"
````

**Respuesta esperada:**

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

### 20. Obtener Notificaciones (GET /api/users/notifications)

```bash
curl -X GET "${BASE_URL_USERS}/api/users/notifications" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "${HEADERS}"
```

**Respuesta esperada:**

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

### 21. Obtener Campos Favoritos (GET /api/users/favorite-fields)

```bash
curl -X GET "${BASE_URL_USERS}/api/users/favorite-fields" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "${HEADERS}"
```

**Respuesta esperada:**

```json
["1", "2", "3"]
```

curl -X POST "${BASE_URL_USERS}/api/v1/auth/login" \
  -H "${HEADERS}" \
 -d '{
"email": "maria.garcia@ejemplo.com",
"password": "Password123!"
}'

````

### 19. Solicitar Reset de Contraseña

```bash
curl -X POST "${BASE_URL_USERS}/api/v1/auth/request-password-reset" \
  -H "${HEADERS}" \
  -d '{
    "email": "maria.garcia@ejemplo.com"
  }'
````

### 20. Validar Token

```bash
curl -X GET "${BASE_URL_USERS}/api/v1/auth/validate-token" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 21. Obtener Perfil de Usuario Autenticado (NUEVO)

```bash
curl -X GET "${BASE_URL_USERS}/api/v1/auth/me" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

---

## 💳 PAGOS (BackMP)

### 21. Crear Preferencia de Pago

```bash
curl -X POST "${BASE_URL_PAYMENTS}/api/payments/preference" \
  -H "${HEADERS}" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "bookingId": 123,
    "amount": 5000,
    "currency": "ARS",
    "description": "Reserva de cancha de fútbol",
    "payerEmail": "juan.perez@ejemplo.com",
    "expirationDate": "2024-12-31T23:59:59Z"
  }'
```

### 22. Obtener Estado de Pago

```bash
curl -X GET "${BASE_URL_PAYMENTS}/api/payments/PAYMENT_ID/status" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 23. Obtener Historial de Pagos

```bash
curl -X GET "${BASE_URL_PAYMENTS}/api/payments/history?page=1&limit=10" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 24. Procesar Reembolso

```bash
curl -X POST "${BASE_URL_PAYMENTS}/api/payments/PAYMENT_ID/refund" \
  -H "${HEADERS}" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "reason": "Cancelación de reserva",
    "amount": 5000
  }'
```

### 25. Obtener Estado de Reembolso

```bash
curl -X GET "${BASE_URL_PAYMENTS}/api/payments/PAYMENT_ID/refund-status" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 26. Obtener Factura

```bash
curl -X GET "${BASE_URL_PAYMENTS}/api/payments/PAYMENT_ID/invoice" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 27. Enviar Factura por Email

```bash
curl -X POST "${BASE_URL_PAYMENTS}/api/payments/PAYMENT_ID/invoice/send-email" \
  -H "${HEADERS}" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "email": "cliente@ejemplo.com"
  }'
```

### 28. Obtener Reportes de Pagos (Admin)

```bash
curl -X GET "${BASE_URL_PAYMENTS}/api/payments/admin/reports?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer TOKEN_ADMIN_JWT"
```

---

## 🔗 WEBHOOKS

### 29. Webhook de MercadoPago (simulación)

```bash
curl -X POST "${BASE_URL_PAYMENTS}/api/payments/webhook" \
  -H "${HEADERS}" \
  -d '{
    "type": "payment",
    "data": {
      "id": "PAYMENT_ID"
    }
  }'
```

---

## 📊 MÉTRICAS Y MONITOREO

### 30. Health Check

```bash
curl -X GET "${BASE_URL_USERS}/health"
```

### 31. Métricas del Sistema

```bash
curl -X GET "${BASE_URL_PAYMENTS}/metrics"
```

---

## 📚 DOCUMENTACIÓN

### 32. Swagger UI

```bash
# Abrir en navegador:
# http://localhost:3000/api-docs
```

---

## 🧪 EJEMPLOS DE USO COMPLETO

### Flujo completo de registro y pago:

```bash
# 1. Registrar usuario
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL_USERS}/api/users/register" \
  -H "${HEADERS}" \
  -d '{
    "name": "Test User",
    "email": "test@ejemplo.com",
    "password": "Password123!"
  }')

echo "Respuesta de registro: $REGISTER_RESPONSE"

# 2. Hacer login
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL_USERS}/api/users/login" \
  -H "${HEADERS}" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Password123!"
  }')

echo "Respuesta de login: $LOGIN_RESPONSE"

# 3. Extraer token (requiere jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 4. Crear preferencia de pago
curl -X POST "${BASE_URL_PAYMENTS}/api/payments/preference" \
  -H "${HEADERS}" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bookingId": 123,
    "amount": 5000,
    "currency": "ARS",
    "description": "Reserva de cancha",
    "payerEmail": "test@ejemplo.com"
  }'
```

---

## 📝 NOTAS IMPORTANTES

1. **Reemplaza los tokens**: Sustituye `TU_TOKEN_JWT` y `TOKEN_ADMIN_JWT` con tokens reales obtenidos del login
2. **IDs dinámicos**: Reemplaza `PAYMENT_ID`, `123`, `456` con IDs reales de tu base de datos
3. **Puertos**: Ajusta los puertos si tu aplicación corre en puertos diferentes
4. **Variables de entorno**: Asegúrate de que las variables de entorno estén configuradas correctamente
5. **Base de datos**: Verifica que la base de datos esté corriendo y accesible

## 🚀 PARA EJECUTAR TODOS LOS COMANDOS

Puedes crear un script bash con estos comandos:

```bash
#!/bin/bash
# Guardar como test-api.sh y ejecutar con: ./test-api.sh

# Configurar variables
BASE_URL_USERS="http://localhost:3000"
BASE_URL_PAYMENTS="http://localhost:3001"
HEADERS="Content-Type: application/json"

echo "🧪 Iniciando pruebas de API..."
echo "=================================="

# Ejecutar comandos uno por uno...
# (copiar los comandos que necesites)
```

---

## 🎯 ENDPOINTS CONFIGURADOS PARA FRONTEND

### GET /api/auth/me - Obtener Usuario Autenticado

```bash
curl -X GET "${BASE_URL_USERS}/api/auth/me" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "${HEADERS}"
```

**Respuesta esperada:**

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

### GET /api/users/notifications - Obtener Notificaciones

```bash
curl -X GET "${BASE_URL_USERS}/api/users/notifications" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "${HEADERS}"
```

**Respuesta esperada:**

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

### GET /api/users/favorite-fields - Obtener Campos Favoritos

```bash
curl -X GET "${BASE_URL_USERS}/api/users/favorite-fields" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -H "${HEADERS}"
```

**Respuesta esperada:**

```json
["1", "2", "3"]
```

---

## 🌐 CONFIGURACIÓN CORS

El backend está configurado para permitir peticiones desde:

- `http://localhost:3001`
- `http://localhost:4000`

Para verificar la configuración CORS:

```bash
curl -X OPTIONS "${BASE_URL_USERS}/api/auth/me" \
  -H "Origin: http://localhost:4000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```
