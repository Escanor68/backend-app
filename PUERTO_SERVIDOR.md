# Configuración del Puerto - BackUPyUC Server

## 🚀 Puerto por Defecto

El servidor **BackUPyUC** se ejecuta por defecto en el **puerto 3000**.

## 🔧 Configuración del Puerto

### 1. Variable de Entorno

El puerto se configura a través de la variable de entorno `PORT`:

```bash
# En el archivo .env
PORT=3000
```

### 2. Configuración en Código

```typescript
// En src/index.ts (línea ~210)
const PORT = process.env.PORT || 3000;
```

```typescript
// En src/config/index.ts (línea ~51)
server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
},
```

## 🌐 URLs del Servidor

### URLs Principales

- **Servidor Principal**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **API Documentation**: `http://localhost:3000/api-docs` (solo en desarrollo)

### Endpoints de la API

- **Users API**: `http://localhost:3000/api/users`
- **Auth API**: `http://localhost:3000/api/auth`
- **Auth v1 API**: `http://localhost:3000/api/v1/auth`
- **Nuevo endpoint /me**: `http://localhost:3000/api/v1/auth/me`

## 🐳 Configuración en Docker

En el archivo `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - '3000:3000' # Puerto externo:puerto interno
```

## 📋 Información Mostrada en Terminal

Cuando el servidor se inicia, muestra una interfaz visual con toda la información:

```
╔══════════════════════════════════════════════════════════════╗
║                    🚀 BACKUPYUC SERVER                      ║
╠══════════════════════════════════════════════════════════════╣
║  🔧 Environment: development
║  🌐 Server URL: http://localhost:3000
║  🔌 Socket.IO: Enabled
║  🛡️ Security: Helmet, CORS, CSRF, Rate Limiting
║  📦 Database: Connected
╠══════════════════════════════════════════════════════════════╣
║                        📋 ENDPOINTS                          ║
╠══════════════════════════════════════════════════════════════╣
║  ❤️  Health Check: http://localhost:3000/health
║  👥 Users API: http://localhost:3000/api/users
║  🔐 Auth API: http://localhost:3000/api/auth
║  🔐 Auth v1 API: http://localhost:3000/api/v1/auth
║  🔐 NEW /me endpoint: http://localhost:3000/api/v1/auth/me
║  📚 API Docs: http://localhost:3000/api-docs
╠══════════════════════════════════════════════════════════════╣
║                        🛠️  FEATURES                          ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ User Registration & Authentication
║  ✅ JWT Token Management
║  ✅ Password Reset
║  ✅ Role-based Authorization
║  ✅ Real-time Notifications (Socket.IO)
║  ✅ Audit Logging
║  ✅ Rate Limiting
║  ✅ CORS Protection
║  ✅ CSRF Protection
║  ✅ Input Validation
╠══════════════════════════════════════════════════════════════╣
║  🕐 Started at: 7/12/2024, 3:30:45 PM
╚══════════════════════════════════════════════════════════════╝
```

## 🔄 Cambiar el Puerto

### Opción 1: Variable de Entorno

```bash
# En terminal
export PORT=4000
npm run dev

# O directamente
PORT=4000 npm run dev
```

### Opción 2: Archivo .env

```bash
# En .env
PORT=4000
```

### Opción 3: Docker

```yaml
# En docker-compose.yml
services:
  app:
    ports:
      - '4000:3000' # Puerto externo 4000, interno 3000
```

## 🧪 Verificar que el Servidor Está Funcionando

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Verificar en Navegador

Abrir: `http://localhost:3000/health`

### 3. Verificar Puerto en Uso

```bash
# Ver qué procesos están usando el puerto 3000
lsof -i :3000

# O con netstat
netstat -tulpn | grep :3000
```

## ⚠️ Solución de Problemas

### Puerto Ya en Uso

Si el puerto 3000 ya está ocupado:

```bash
# Ver qué proceso está usando el puerto
lsof -i :3000

# Matar el proceso (reemplazar PID con el número real)
kill -9 PID

# O cambiar el puerto
PORT=3001 npm run dev
```

### Error de Conexión

```bash
# Verificar si el servidor está corriendo
curl http://localhost:3000/health

# Verificar logs del servidor
npm run dev
```

## 📊 Comparación con Otros Servicios

| Servicio       | Puerto | Descripción                          |
| -------------- | ------ | ------------------------------------ |
| **BackUPyUC**  | 3000   | Servidor de usuarios y autenticación |
| **BackMP**     | 3001   | Servidor de pagos                    |
| **Frontend**   | 3000   | Cliente web (puede causar conflicto) |
| **PostgreSQL** | 5432   | Base de datos                        |

## 🔗 Comandos Útiles

```bash
# Iniciar servidor en desarrollo
npm run dev

# Iniciar servidor en producción
npm start

# Iniciar con puerto específico
PORT=4000 npm run dev

# Verificar estado del servidor
curl http://localhost:3000/health

# Ver logs en tiempo real
npm run dev | grep "BackUPyUC"
```
