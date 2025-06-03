# 🗄️ **MIGRACIÓN A MYSQL - BACKEND APP FUTBOL**

## ✅ **CONFIRMACIÓN DE COMPATIBILIDAD**

### **¡SÍ, ambos backends SOPORTAN MySQL perfectamente!**

- **BackUPyUC**: Ya tiene `mysql-await` en package.json ✅
- **BackMP**: Solo necesita instalar el driver MySQL ✅
- **TypeORM**: Soporta MySQL nativamente ✅

---

## 📦 **PASO 1: INSTALAR DEPENDENCIAS MySQL**

### **Para BackMP** (solo necesita el driver):

```bash
cd BackMP
npm install mysql2
npm install @types/mysql2 --save-dev
```

### **Para BackUPyUC** (ya tiene mysql-await, pero agregar mysql2 también):

```bash
cd BackUPyUC
npm install mysql2
npm install @types/mysql2 --save-dev
```

---

## 🔧 **PASO 2: CONFIGURAR VARIABLES DE ENTORNO**

### **BackUPyUC/.env**:

```env
# Base de datos MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password_mysql
DB_NAME=backupyuc

# Otras configuraciones...
PORT=3001
NODE_ENV=development
JWT_SECRET=tu-secreto-seguro
```

### **BackMP/.env**:

```env
# Base de datos MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password_mysql
DB_NAME=backmp

# Otras configuraciones...
PORT=3003
NODE_ENV=development
JWT_SECRET=tu-secreto-seguro
MP_ACCESS_TOKEN=tu_token_mercadopago
```

---

## 🗃️ **PASO 3: CREAR BASES DE DATOS**

### **Ejecutar en MySQL:**

```sql
-- Crear bases de datos
CREATE DATABASE IF NOT EXISTS backupyuc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS backmp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar creación
SHOW DATABASES;
```

---

## 📋 **PASO 4: CREAR TABLAS**

### **Para BackUPyUC (Base de datos: backupyuc)**:

```sql
USE backupyuc;

-- Tabla users
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `roles` JSON NOT NULL DEFAULT ('["user"]'),
    `preferredLocation` JSON NULL,
    `notificationPreferences` JSON NOT NULL DEFAULT ('{"email": true, "push": true, "sms": false}'),
    `isBlocked` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_created_at` (`createdAt`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla favorite_fields
CREATE TABLE `favorite_fields` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `fieldId` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_favorite_fields_user_id` (`userId`),
    INDEX `idx_favorite_fields_field_id` (`fieldId`),

    CONSTRAINT `fk_favorite_fields_user`
        FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla notifications
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `type` ENUM('booking_reminder', 'payment_pending', 'booking_cancelled') NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    `userId` CHAR(36) NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_notifications_user_id` (`userId`),
    INDEX `idx_notifications_read` (`read`),
    INDEX `idx_notifications_created_at` (`createdAt`),

    CONSTRAINT `fk_notifications_user`
        FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### **Para BackMP (Base de datos: backmp)**:

```sql
USE backmp;

-- Tabla payments
CREATE TABLE `payments` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `bookingId` VARCHAR(255) NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `payment_method` VARCHAR(100) NOT NULL,
    `field` JSON NOT NULL,
    `preferenceId` VARCHAR(255) NULL,
    `mercadoPagoId` VARCHAR(255) NULL,
    `userId` CHAR(36) NULL,
    `metadata` JSON NULL,
    `refund` JSON NULL,
    `invoice` JSON NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_payments_user_id` (`userId`),
    INDEX `idx_payments_booking_id` (`bookingId`),
    INDEX `idx_payments_status` (`status`),
    INDEX `idx_payments_preference_id` (`preferenceId`),
    INDEX `idx_payments_mercadopago_id` (`mercadoPagoId`),
    INDEX `idx_payments_created_at` (`createdAt`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🔄 **PASO 5: CAMBIAR CONFIGURACIÓN EN EL CÓDIGO**

### **BackUPyUC - Usar configuración MySQL:**

Editar `BackUPyUC/src/config/database.ts`:

```typescript
import { DataSource } from 'typeorm';
import { configWithMySQL } from './mysql.config'; // <-- Usar la nueva config

console.log('📦 [Database] Configurando conexión a MySQL...');

export const AppDataSource = new DataSource(configWithMySQL.database);

// ... resto del código igual
```

### **BackMP - Usar configuración MySQL:**

Editar `BackMP/src/config/database.ts`:

```typescript
import { DataSource } from 'typeorm';
import { configWithMySQL } from './mysql.config'; // <-- Usar la nueva config

export const AppDataSource = new DataSource(configWithMySQL.database);
```

Y editar `BackMP/src/config/index.ts`:

```typescript
import { configWithMySQL } from './mysql.config';

export const config = configWithMySQL; // <-- Usar la config de MySQL
```

---

## 🚀 **PASO 6: PROBAR LA CONEXIÓN**

### **Script de verificación:**

```bash
# En BackUPyUC
cd BackUPyUC
npm run dev

# En BackMP (en otra terminal)
cd BackMP
npm run dev
```

### **Logs esperados:**

```
📦 [Database] Configurando conexión a MySQL...
🔄 [Database] Iniciando conexión a base de datos...
📊 [Database] Configuración: { type: 'mysql', host: 'localhost', ... }
✅ [Database] Conexión a base de datos establecida exitosamente
```

---

## 📊 **PASO 7: VERIFICAR DATOS**

### **Consultas de prueba:**

```sql
-- Verificar tablas creadas
USE backupyuc;
SHOW TABLES;
DESCRIBE users;

USE backmp;
SHOW TABLES;
DESCRIBE payments;

-- Insertar usuario de prueba
USE backupyuc;
INSERT INTO `users` (
    `id`,
    `name`,
    `email`,
    `password`,
    `roles`
) VALUES (
    UUID(),
    'Usuario Prueba',
    'test@example.com',
    '$2b$10$hashedpassword',
    '["user"]'
);

-- Verificar inserción
SELECT * FROM users;
```

---

## 🔍 **CARACTERÍSTICAS DE LAS TABLAS**

### **users** (BackUPyUC):

- ✅ UUIDs como Primary Keys
- ✅ Email único indexado
- ✅ Roles en formato JSON
- ✅ Preferencias de notificación JSON
- ✅ Ubicación preferida (lat/lng) JSON

### **favorite_fields** (BackUPyUC):

- ✅ Relación con users (FK)
- ✅ Información del campo favorito
- ✅ Índices optimizados

### **notifications** (BackUPyUC):

- ✅ Sistema de notificaciones tipado
- ✅ Estados de lectura
- ✅ Relación con users

### **payments** (BackMP):

- ✅ Integración completa con MercadoPago
- ✅ Metadata JSON flexible
- ✅ Sistema de reembolsos
- ✅ Generación de facturas
- ✅ Múltiples índices para rendimiento

---

## 🚨 **TROUBLESHOOTING**

### **Error de conexión:**

```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Reiniciar si es necesario
sudo systemctl restart mysql
```

### **Error de permisos:**

```sql
-- Crear usuario específico para la app
CREATE USER 'appfutbol'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON backupyuc.* TO 'appfutbol'@'localhost';
GRANT ALL PRIVILEGES ON backmp.* TO 'appfutbol'@'localhost';
FLUSH PRIVILEGES;
```

### **Error de charset:**

```sql
-- Verificar configuración
SHOW VARIABLES LIKE 'char%';
SHOW VARIABLES LIKE 'collation%';
```

---

## ✨ **VENTAJAS DE USAR MySQL**

1. **Rendimiento**: Excelente para aplicaciones web
2. **Escalabilidad**: Maneja bien el crecimiento
3. **JSON nativo**: Soporte completo para campos JSON
4. **Índices optimizados**: Consultas rápidas
5. **Transacciones ACID**: Integridad de datos
6. **Replicación**: Fácil backup y replicación

---

## 📝 **NOTAS IMPORTANTES**

- ⚠️ **Backup**: Siempre haz backup antes de migrar
- 🔐 **Seguridad**: Usa contraseñas fuertes
- 📊 **Monitoreo**: Monitorea el rendimiento post-migración
- 🔄 **Testing**: Prueba todas las funcionalidades después del cambio

**¡Tu backend está 100% listo para MySQL! 🎉**
