-- ========================================
-- ESQUEMAS DE BASE DE DATOS MYSQL
-- Backend App Futbol
-- ========================================

-- Crear bases de datos
CREATE DATABASE IF NOT EXISTS backupyuc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS backmp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- BACKUPYUC - SISTEMA DE USUARIOS
-- ========================================
USE backupyuc;

-- Tabla: users
CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    roles JSON NOT NULL DEFAULT ('["user"]'),
    preferredLocation JSON NULL COMMENT 'Formato: {"lat": number, "lng": number}',
    notificationPreferences JSON NOT NULL DEFAULT ('{"email": true, "push": true, "sms": false}'),
    isBlocked BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (createdAt)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla: favorite_fields
CREATE TABLE favorite_fields (
    id CHAR(36) NOT NULL PRIMARY KEY,
    fieldId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    userId CHAR(36) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_favorite_fields_user_id (userId),
    INDEX idx_favorite_fields_field_id (fieldId),
    INDEX idx_user_field (userId, fieldId),
    
    CONSTRAINT fk_favorite_fields_user 
        FOREIGN KEY (userId) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla: notifications
CREATE TABLE notifications (
    id CHAR(36) NOT NULL PRIMARY KEY,
    type ENUM('booking_reminder', 'payment_pending', 'booking_cancelled') NOT NULL,
    message TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    userId CHAR(36) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_notifications_user_id (userId),
    INDEX idx_notifications_read (`read`),
    INDEX idx_notifications_created_at (createdAt),
    INDEX idx_user_unread (userId, `read`),
    
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (userId) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- BACKMP - SISTEMA DE PAGOS
-- ========================================
USE backmp;

-- Tabla: payments
CREATE TABLE payments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    bookingId VARCHAR(255) NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    field JSON NOT NULL COMMENT 'Formato: {"id": string, "name": string}',
    preferenceId VARCHAR(255) NULL,
    mercadoPagoId VARCHAR(255) NULL,
    userId CHAR(36) NULL,
    metadata JSON NULL,
    refund JSON NULL COMMENT 'Formato: {"status": string, "reason": string, "amount": number, "date": Date}',
    invoice JSON NULL COMMENT 'Formato: {"number": string, "url": string, "sentTo": string[], "lastSentAt": Date}',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_payments_user_id (userId),
    INDEX idx_payments_booking_id (bookingId),
    INDEX idx_payments_status (status),
    INDEX idx_payments_preference_id (preferenceId),
    INDEX idx_payments_mercadopago_id (mercadoPagoId),
    INDEX idx_payments_created_at (createdAt),
    INDEX idx_user_status (userId, status),
    INDEX idx_status_created (status, createdAt)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- DATOS DE EJEMPLO Y VERIFICACIÓN
-- ========================================

-- Usuario de prueba para BackUPyUC
USE backupyuc;
INSERT INTO users (
    id, 
    name, 
    email, 
    password, 
    phone, 
    roles,
    notificationPreferences
) VALUES (
    UUID(),
    'Usuario de Prueba',
    'test@example.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    '+1234567890',
    '["user"]',
    '{"email": true, "push": true, "sms": false}'
);

-- Verificar inserción
SELECT 'Usuarios creados:' as Info, COUNT(*) as Total FROM users;

-- ========================================
-- CONSULTAS DE VERIFICACIÓN
-- ========================================

-- Verificar estructura de tablas BackUPyUC
USE backupyuc;
SHOW TABLES;
DESCRIBE users;
DESCRIBE favorite_fields;
DESCRIBE notifications;

-- Verificar estructura de tablas BackMP
USE backmp;
SHOW TABLES;
DESCRIBE payments;

-- ========================================
-- CONFIGURACIONES RECOMENDADAS
-- ========================================

-- Variables de sistema recomendadas (ejecutar como administrador)
-- SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
-- SET GLOBAL innodb_file_format = 'Barracuda';
-- SET GLOBAL innodb_file_per_table = 1;
-- SET GLOBAL innodb_large_prefix = 1;

-- ========================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ========================================

/*
RESUMEN DE TABLAS CREADAS:

BASE DE DATOS: backupyuc (Puerto 3001)
--------------------------------
1. users - Usuarios del sistema
   - id: UUID (Primary Key)
   - email: Único, indexado
   - roles: JSON array de roles
   - notificationPreferences: JSON de preferencias

2. favorite_fields - Campos favoritos por usuario
   - Relación FK con users
   - Índices para búsquedas rápidas

3. notifications - Sistema de notificaciones
   - Tipos predefinidos (ENUM)
   - Estado de lectura
   - Relación FK con users

BASE DE DATOS: backmp (Puerto 3003)
--------------------------------
1. payments - Registro de pagos
   - Integración con MercadoPago
   - Campos JSON para flexibilidad
   - Múltiples índices para rendimiento
   - Soporte para reembolsos y facturas

CARACTERÍSTICAS ESPECIALES:
- Soporte completo UTF8MB4 para emojis
- Índices optimizados para consultas frecuentes
- Foreign Keys con CASCADE para integridad
- Campos JSON para datos flexibles
- UUIDs como Primary Keys
- Timestamps automáticos
*/ 