# Scripts de Package.json - BackUPyUC

## 🚀 Scripts Principales

### Desarrollo

```bash
# Iniciar servidor en modo desarrollo (con hot reload)
npm run dev

# Iniciar servidor en modo debug (con inspector de Node.js)
npm run dev:debug

# Verificar tipos TypeScript sin compilar
npm run type-check
```

### Producción

```bash
# Compilar TypeScript a JavaScript
npm run build

# Compilar en modo watch (recompila automáticamente)
npm run build:watch

# Iniciar servidor en producción
npm start

# Limpiar carpeta dist
npm run clean
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests en CI
npm run test:ci

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration

# Ejecutar tests end-to-end
npm run test:e2e
```

## 🔍 Linting y Verificación

```bash
# Verificar código con ESLint
npm run lint

# Corregir errores de ESLint automáticamente
npm run lint:fix

# Verificar tipos TypeScript
npm run type-check

# Ejecutar todas las verificaciones (lint + type-check + test)
npm run check
```

## 🗄️ Base de Datos

```bash
# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

# Generar nueva migración
npm run migration:generate

# Crear migración vacía
npm run migration:create

# Ejecutar seeders
npm run db:seed

# Resetear base de datos (revert + run + seed)
npm run db:reset
```

## 📋 Descripción Detallada de Scripts

### `npm run dev`

- **Descripción**: Inicia el servidor en modo desarrollo
- **Comando**: `nodemon src/index.ts`
- **Características**:
  - Hot reload automático
  - Variables de entorno de desarrollo
  - Logs detallados
  - Reinicio automático al cambiar archivos

### `npm run dev:debug`

- **Descripción**: Inicia el servidor en modo debug
- **Comando**: `nodemon --inspect src/index.ts`
- **Características**:
  - Inspector de Node.js habilitado
  - Útil para debugging con VS Code
  - Hot reload automático

### `npm run build`

- **Descripción**: Compila TypeScript a JavaScript
- **Comando**: `tsc`
- **Características**:
  - Limpia la carpeta `dist` antes de compilar
  - Genera archivos JavaScript optimizados
  - Verifica tipos TypeScript

### `npm start`

- **Descripción**: Inicia el servidor en producción
- **Comando**: `node dist/index.js`
- **Características**:
  - Usa archivos compilados
  - Variables de entorno de producción
  - Sin hot reload

### `npm test`

- **Descripción**: Ejecuta todos los tests
- **Comando**: `jest`
- **Características**:
  - Tests unitarios, integración y e2e
  - Coverage report
  - Configuración en `jest.config.ts`

### `npm run migration:run`

- **Descripción**: Ejecuta migraciones pendientes
- **Comando**: `typeorm-ts-node-commonjs migration:run -d src/config/database.ts`
- **Características**:
  - Actualiza esquema de base de datos
  - Usa TypeORM
  - Configuración en `src/config/database.ts`

## 🔧 Configuración de Nodemon

El archivo `nodemon.json` configura el comportamiento del servidor en desarrollo:

```json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["src/**/*.test.ts", "src/**/*.spec.ts", "dist"],
  "exec": "ts-node src/index.ts",
  "env": {
    "NODE_ENV": "development"
  },
  "delay": "1000",
  "verbose": true
}
```

### Configuración:

- **`watch`**: Monitorea cambios en la carpeta `src`
- **`ext`**: Extensiones de archivos a monitorear
- **`ignore`**: Archivos a ignorar (tests, dist)
- **`exec`**: Comando a ejecutar
- **`env`**: Variables de entorno
- **`delay`**: Delay antes de reiniciar (1 segundo)

## 🚀 Flujo de Desarrollo Típico

### 1. Iniciar Desarrollo

```bash
cd BackUPyUC
npm install
npm run dev
```

### 2. Verificar Código

```bash
npm run check  # lint + type-check + test
```

### 3. Preparar para Producción

```bash
npm run build
npm start
```

### 4. Trabajar con Base de Datos

```bash
npm run migration:generate -- src/migrations/NombreMigracion
npm run migration:run
npm run db:seed
```

## ⚠️ Solución de Problemas

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"

```bash
# Verificar qué proceso usa el puerto
lsof -i :3000

# Matar el proceso
kill -9 PID

# O cambiar puerto
PORT=3001 npm run dev
```

### Error: "TypeScript compilation failed"

```bash
# Verificar tipos
npm run type-check

# Limpiar y recompilar
npm run clean
npm run build
```

### Error: "Database connection failed"

```bash
# Verificar configuración de base de datos
# Revisar variables de entorno en .env
# Verificar que la base de datos esté corriendo
```

## 📊 Comandos Útiles Adicionales

```bash
# Ver logs en tiempo real
npm run dev | grep "BackUPyUC"

# Verificar estado del servidor
curl http://localhost:3000/health

# Ver procesos en puerto 3000
lsof -i :3000

# Ver dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update

# Ver tamaño del bundle
npm run build && du -sh dist/
```
