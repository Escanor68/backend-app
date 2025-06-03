# 🐛 Sistema de Debugging con Console.log

Este documento describe el sistema de debugging implementado en el proyecto de fútbol backend utilizando `console.log` estratégicos.

## 📋 Resumen de Cambios

### 🏗️ Archivos Modificados

#### BackMP (Aplicación de Pagos)

- ✅ `src/index.ts` - Servidor principal con logs de inicialización
- ✅ `src/controllers/payment.controller.ts` - Controlador de pagos con logs detallados
- ✅ `src/middleware/auth.ts` - Middleware de autenticación con logs de seguridad
- ✅ `src/routes/payment.routes.ts` - Rutas con logs de registro y ejecución

#### BackUPyUC (Aplicación de Usuarios)

- ✅ `src/index.ts` - Servidor principal con logs de inicialización
- ✅ `src/controllers/user.controller.ts` - Controlador de usuarios con logs detallados
- ✅ `src/middleware/errorHandler.ts` - Middleware de manejo de errores con logs
- ✅ `src/middleware/notFoundHandler.ts` - Middleware 404 con logs
- ✅ `src/config/database.ts` - Configuración de base de datos con logs

### 🔧 Errores de TypeScript Resueltos

- ✅ Instalación de `@types/compression` y `@types/swagger-ui-express`
- ✅ Creación de middleware `errorHandler.ts` y `notFoundHandler.ts`
- ✅ Configuración de base de datos con `setupDatabase` function
- ✅ Tipado correcto del parámetro `error` en catch blocks

## 🔍 Tipos de Logs Implementados

### 📱 Logs de Aplicación Principal

```bash
🚀 [BackMP] Iniciando aplicación de pagos...
📱 [BackMP] Express app y servidor HTTP creados
🔌 [BackMP] Socket.IO configurado con opciones: {...}
🌐 [BackMP] CORS configurado: {...}
📄 [BackMP] Middleware JSON configurado
💳 [BackMP] Rutas de pagos configuradas en /api/payments
```

### 🔐 Logs de Autenticación

```bash
🔐 [Auth] authenticate - Iniciando autenticación...
🔍 [Auth] Required roles: ['admin']
🎫 [Auth] Authorization header presente: true
🎫 [Auth] Token extraído (primeros 20 caracteres): eyJhbGciOiJIUzI1NiIsI...
✅ [Auth] Token JWT válido
👤 [Auth] Usuario decodificado: {id: "123", email: "user@example.com", roles: ["user"]}
```

### 💳 Logs de Controlador de Pagos

```bash
💳 [PaymentController] createPaymentPreference - Iniciando...
📊 [PaymentController] Request body: {...}
👤 [PaymentController] Usuario: {...}
✅ [PaymentController] Preferencia de pago creada: {...}
```

### 👤 Logs de Controlador de Usuarios

```bash
⭐ [UserController] addFavoriteField - Iniciando...
📊 [UserController] Datos del campo favorito: {fieldId: "123", name: "Campo A", userId: "456"}
💾 [UserController] Guardando campo favorito...
✅ [UserController] Campo favorito agregado exitosamente: {...}
```

### 🛣️ Logs de Rutas

```bash
🛣️ [PaymentRoutes] Configurando rutas de pagos...
📝 [PaymentRoutes] Registrando ruta pública: POST /webhook
🔒 [PaymentRoutes] Aplicando middleware de autenticación a rutas protegidas
🔗 [PaymentRoutes] Crear preferencia de pago - POST /preference
```

### 📡 Logs de Requests

```bash
📡 [BackMP] POST /api/payments/preference - IP: 192.168.1.100 - User-Agent: Mozilla/5.0...
🔍 [BackMP] Request body: {amount: 1000, currency: "ARS"}
🔍 [BackMP] Request query: {}
```

### 🔌 Logs de Socket.IO

```bash
🔌 [BackMP] Cliente conectado - Socket ID: abc123
🔌 [BackMP] Cliente desconectado - Socket ID: abc123, Razón: disconnect
🔌 [BackMP] Error en socket abc123: Error message
```

### 📦 Logs de Base de Datos

```bash
📦 [Database] Configurando conexión a base de datos...
🔄 [Database] Iniciando conexión a base de datos...
📊 [Database] Configuración: {type: "postgres", host: "localhost", port: 5432}
✅ [Database] Conexión a base de datos establecida exitosamente
```

### ❌ Logs de Manejo de Errores

```bash
❌ [ErrorHandler] Error interceptado: ValidationError
⚠️ [ErrorHandler] Error de validación detectado
🔐 [ErrorHandler] Error de JWT detectado
🔍 [NotFoundHandler] Ruta no encontrada: GET /api/nonexistent
```

## 🚀 Cómo Usar el Sistema de Debugging

### 1. Verificar Configuración

```bash
# En BackUPyUC, ejecutar script de verificación
cd BackUPyUC
node verify-setup.js
```

### 2. Iniciar las Aplicaciones

```bash
# Terminal 1 - BackMP (Pagos)
cd BackMP
npm run dev

# Terminal 2 - BackUPyUC (Usuarios)
cd BackUPyUC
npm run dev
```

### 3. Observar Logs en Tiempo Real

Los logs aparecerán automáticamente en la consola con emojis y códigos de colores para facilitar la identificación:

- 🚀 Inicialización
- 📡 Requests HTTP
- 🔐 Autenticación y autorización
- 💳 Operaciones de pago
- 👤 Operaciones de usuario
- 🔌 Eventos de Socket.IO
- 📦 Base de datos
- ❌ Errores
- ✅ Operaciones exitosas

### 4. Filtrar Logs por Componente

Puedes usar `grep` para filtrar logs específicos:

```bash
# Solo logs de autenticación
npm run dev | grep "\[Auth\]"

# Solo logs de pagos
npm run dev | grep "\[PaymentController\]"

# Solo logs de base de datos
npm run dev | grep "\[Database\]"

# Solo errores
npm run dev | grep "❌"

# Solo operaciones exitosas
npm run dev | grep "✅"
```

### 5. Debugging de APIs

Cuando hagas requests a las APIs, verás logs como:

```bash
📡 [BackMP] POST /api/payments/preference - IP: 127.0.0.1 - User-Agent: PostmanRuntime/7.28.4...
🔍 [BackMP] Request body: {
  "amount": 1000,
  "currency": "ARS",
  "description": "Pago por reserva de cancha"
}
🔐 [Auth] authenticate - Iniciando autenticación...
🎫 [Auth] Authorization header presente: true
✅ [Auth] Token JWT válido
💳 [PaymentController] createPaymentPreference - Iniciando...
📊 [PaymentController] Request body: {...}
✅ [PaymentController] Preferencia de pago creada: {...}
```

## 🔧 Configuración Adicional

### Variables de Entorno para Logging

Puedes agregar estas variables a tus archivos `.env`:

```env
# Nivel de logging (opcional)
LOG_LEVEL=debug

# Habilitar logs de SQL (si usas TypeORM)
TYPEORM_LOGGING=true

# Formato de logs
LOG_FORMAT=combined

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=backupyuc
```

### Logs Personalizados

Para agregar más logs a tu código:

```typescript
// Logs informativos
console.log('📋 [ComponentName] Información importante');

// Logs de debugging
console.log('🔍 [ComponentName] Variable:', variable);

// Logs de error
console.error('❌ [ComponentName] Error:', error);

// Logs de éxito
console.log('✅ [ComponentName] Operación exitosa');

// Logs de warning
console.warn('⚠️ [ComponentName] Advertencia:', warning);
```

## 📊 Monitoreo y Análisis

### 1. Logs de Performance

Para medir el rendimiento de las operaciones:

```typescript
console.time('⏱️ [ComponentName] OperationName');
// ... tu código ...
console.timeEnd('⏱️ [ComponentName] OperationName');
```

### 2. Logs de Memoria

Para monitorear el uso de memoria:

```typescript
const used = process.memoryUsage();
console.log('🧠 [Memory] RAM usage:', {
  rss: Math.round((used.rss / 1024 / 1024) * 100) / 100 + ' MB',
  heapTotal: Math.round((used.heapTotal / 1024 / 1024) * 100) / 100 + ' MB',
  heapUsed: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100 + ' MB',
});
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Demasiados logs en consola**

   - Usa `grep` para filtrar
   - Comenta logs específicos temporalmente

2. **Logs no aparecen**

   - Verifica que el servidor esté corriendo
   - Revisa la configuración de NODE_ENV

3. **Performance impactado**

   - En producción, reemplaza `console.log` con un logger profesional como `winston`

4. **Errores de TypeScript**
   - Ejecuta `node verify-setup.js` para verificar configuración
   - Instala dependencias faltantes: `npm install --save-dev @types/package-name`

### Resolución de Errores TypeScript

Los siguientes errores han sido resueltos:

- ✅ **Module not found 'compression'** → Instalado `@types/compression`
- ✅ **Module not found 'swagger-ui-express'** → Instalado `@types/swagger-ui-express`
- ✅ **Module not found './middleware/errorHandler'** → Creado archivo
- ✅ **Module not found './middleware/notFoundHandler'** → Creado archivo
- ✅ **Module not found './infrastructure/database'** → Creado en `/config/database`
- ✅ **Parameter 'error' has type 'any'** → Agregado tipado explícito

## 📝 Próximos Pasos

1. **Implementar Winston Logger** para producción
2. **Agregar logs a servicios** de base de datos
3. **Configurar log rotation** para archivos de log
4. **Implementar métricas** con Prometheus
5. **Agregar APM** como New Relic o DataDog
6. **Crear tests unitarios** para los middlewares de debugging

---

¡Con este sistema de debugging tendrás visibilidad completa de lo que sucede en tu aplicación! 🎯
