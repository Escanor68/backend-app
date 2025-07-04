# Integración BackMP con Backend BackFutbol

## Descripción

Este documento describe la integración entre el backend de pagos (BackMP) y el backend principal de BackFutbol para la gestión de reservas y notificaciones. El objetivo es que en el futuro se pueda extender fácilmente a otros deportes como pádel.

## Flujo de Integración

### 1. Pago Exitoso → Generación de Reserva

Cuando un pago es aprobado en MercadoPago, el flujo es el siguiente:

1. **Webhook de MercadoPago** llega a BackMP
2. **BackMP procesa el webhook** y actualiza el estado del pago
3. **Si el pago es APROBADO**, BackMP notifica a BackFutbol
4. **BackFutbol genera la reserva** en el sistema principal
5. **BackFutbol notifica a otros usuarios** que la cancha ya no está disponible

### 2. Pago Cancelado/Reembolsado → Cancha Disponible

Cuando un pago es cancelado o reembolsado:

1. **BackMP actualiza el estado** del pago
2. **BackMP notifica a BackFutbol** que la cancha está disponible nuevamente
3. **BackFutbol actualiza la disponibilidad** y puede notificar a usuarios interesados

## Endpoints de Comunicación

### BackMP → BackFutbol

#### 1. Notificar Pago Exitoso

```
POST /api/payments/successful
```

**Payload:**

```json
{
    "paymentId": "uuid",
    "bookingId": "uuid",
    "fieldId": "uuid",
    "userId": "uuid",
    "amount": 100.0,
    "paymentMethod": "credit_card",
    "mercadoPagoId": "mp_payment_id",
    "preferenceId": "mp_preference_id",
    "field": {
        "id": "uuid",
        "name": "Cancha 1",
        "ownerId": "uuid",
        "ownerName": "Juan Pérez",
        "ownerEmail": "juan@example.com",
        "location": "Av. Principal 123",
        "price": 100.0
    },
    "user": {
        "id": "uuid",
        "email": "usuario@example.com",
        "name": "Usuario"
    },
    "metadata": {}
}
```

#### 2. Notificar Cancha Reservada

```
POST /api/notifications/field-booked
```

**Payload:**

```json
{
    "fieldId": "uuid",
    "bookingId": "uuid",
    "message": "La cancha \"Cancha 1\" ya no está disponible para el horario seleccionado.",
    "type": "FIELD_BOOKED",
    "data": {
        "fieldId": "uuid",
        "fieldName": "Cancha 1",
        "bookingId": "uuid",
        "bookedBy": "usuario@example.com",
        "amount": 100.0
    }
}
```

#### 3. Notificar Cancha Disponible

```
POST /api/notifications/field-available
```

**Payload:**

```json
{
    "fieldId": "uuid",
    "bookingId": "uuid",
    "message": "La cancha \"Cancha 1\" está disponible nuevamente.",
    "type": "FIELD_AVAILABLE",
    "data": {
        "fieldId": "uuid",
        "fieldName": "Cancha 1",
        "bookingId": "uuid"
    }
}
```

## Configuración

### Variables de Entorno

Agregar al archivo `.env`:

```env
# Configuración de BackFutbol
BACKFUTBOL_BASE_URL=http://localhost:3001
BACKFUTBOL_SECRET=your-secret-key
BACKFUTBOL_TIMEOUT=10000
```

### Verificación de Conectividad

BackMP expone un endpoint para verificar la conectividad con BackFutbol:

```
GET /backfutbol/health
```

**Response:**

```json
{
    "status": "OK",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "backFutbol": {
        "connected": true,
        "baseUrl": "http://localhost:3001",
        "timeout": 10000
    }
}
```

## Logs y Monitoreo

### Logs de BackMP

BackMP registra todas las comunicaciones con BackFutbol:

- `🚀 [BackFutbol] Notificando pago exitoso para generar reserva`
- `✅ [BackFutbol] Reserva generada exitosamente`
- `🔔 [BackFutbol] Notificando que cancha fue reservada`
- `❌ [BackFutbol] Error notificando a BackFutbol`

### Manejo de Errores

- **Errores de comunicación** no afectan el flujo principal de pagos
- **Logs detallados** para debugging
- **Reintentos automáticos** (configurables)
- **Fallback graceful** si BackFutbol no está disponible

## Implementación en BackFutbol

### Endpoints Requeridos

El backend de BackFutbol debe implementar estos endpoints:

1. `POST /api/payments/successful` - Generar reserva
2. `POST /api/notifications/field-booked` - Notificar cancha reservada
3. `POST /api/notifications/field-available` - Notificar cancha disponible
4. `GET /health` - Health check

### Autenticación

Las comunicaciones usan Bearer Token:

```
Authorization: Bearer your-secret-key
```

### Respuestas Esperadas

**Éxito:**

```json
{
    "success": true,
    "message": "Reserva generada exitosamente",
    "data": {
        "bookingId": "uuid",
        "status": "confirmed"
    }
}
```

**Error:**

```json
{
    "success": false,
    "error": "Error message",
    "code": "ERROR_CODE"
}
```

## Testing

### Verificar Integración

1. **Health Check:**

    ```bash
    curl http://localhost:3003/backfutbol/health
    ```

2. **Simular Pago Exitoso:**
    - Crear un pago de prueba
    - Simular webhook de MercadoPago
    - Verificar logs de comunicación

3. **Verificar Logs:**
    ```bash
    # Buscar logs de comunicación
    grep "BackFutbol" logs/app.log
    ```

## Consideraciones de Seguridad

1. **Autenticación mutua** entre servicios
2. **Validación de datos** en ambos lados
3. **Rate limiting** para evitar spam
4. **Logs seguros** sin datos sensibles
5. **Timeouts** para evitar bloqueos

## Troubleshooting

### Problemas Comunes

1. **BackFutbol no responde:**
    - Verificar que esté corriendo en el puerto correcto
    - Verificar conectividad de red
    - Revisar logs de BackFutbol

2. **Errores de autenticación:**
    - Verificar `BACKFUTBOL_SECRET`
    - Verificar formato del token

3. **Timeouts:**
    - Ajustar `BACKFUTBOL_TIMEOUT`
    - Verificar rendimiento de BackFutbol

### Logs de Debug

Activar logs detallados:

```env
NODE_ENV=development
LOG_LEVEL=debug
```
