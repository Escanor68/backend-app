"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentExpirationService = exports.auditService = exports.paymentEvents = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const database_1 = require("./config/database");
const config_1 = require("./config");
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const paymentEvents_1 = require("./events/paymentEvents");
Object.defineProperty(exports, "paymentEvents", { enumerable: true, get: function () { return paymentEvents_1.paymentEvents; } });
const payment_expiration_service_1 = require("./services/payment-expiration.service");
const audit_service_1 = require("./services/audit.service");
const security_utils_1 = require("./utils/security.utils");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
console.log('🚀 [BackMP] Iniciando aplicación de pagos...');
// Crear aplicación Express y servidor HTTP
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
console.log('📱 [BackMP] Express app y servidor HTTP creados');
// Configurar Socket.IO
const io = new socket_io_1.Server(httpServer, config_1.config.socket);
exports.io = io;
console.log('🔌 [BackMP] Socket.IO configurado con opciones:', config_1.config.socket);
// Inicializar servicios de seguridad y limpieza
const auditService = new audit_service_1.AuditService();
exports.auditService = auditService;
const paymentExpirationService = new payment_expiration_service_1.PaymentExpirationService(parseInt(process.env.PAYMENT_EXPIRATION_MINUTES || '30'), // 30 minutos por defecto
process.env.CLEANUP_SCHEDULE || '*/5 * * * *');
exports.paymentExpirationService = paymentExpirationService;
console.log('🛡️ [BackMP] Servicios de seguridad inicializados');
// Configurar middleware de seguridad PCI DSS
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
    message: {
        error: 'Demasiadas solicitudes',
        message: 'Por favor, intente más tarde',
    },
    standardHeaders: true,
    legacyHeaders: false,
}));
console.log('🔒 [BackMP] Rate limiting configurado');
// Configurar middlewares básicos
app.use((0, cors_1.default)(config_1.config.cors));
console.log('🌐 [BackMP] CORS configurado:', config_1.config.cors);
app.use(express_1.default.json({ limit: '10mb' }));
console.log('📄 [BackMP] Middleware JSON configurado');
// Middleware de logging seguro para todas las requests
app.use(async (req, res, next) => {
    const requestInfo = (0, security_utils_1.extractRequestInfo)(req);
    // Log seguro sin datos sensibles
    const safeBody = (0, security_utils_1.maskSensitiveData)(req.body, {
        cardNumber: true,
        cvv: true,
        expirationDate: true,
        email: false, // Permitir email en logs
    });
    console.log(`📡 [BackMP] ${req.method} ${req.path} - IP: ${requestInfo.ip} - User-Agent: ${requestInfo.userAgent.substring(0, 50)}...`);
    // Solo log del body si no contiene datos sensibles
    if (Object.keys(safeBody).length > 0) {
        console.log(`🔍 [BackMP] Request body (masked):`, safeBody);
    }
    console.log(`🔍 [BackMP] Request query:`, req.query);
    // Auditoría de acceso
    if (req.user) {
        await auditService.logAuditEvent({
            timestamp: requestInfo.timestamp,
            userId: req.user.id,
            action: `api.${req.method.toLowerCase()}`,
            resource: req.path,
            ip: requestInfo.ip,
            userAgent: requestInfo.userAgent,
            success: true,
            details: {
                method: req.method,
                path: req.path,
                query: req.query,
                hasBody: Object.keys(req.body).length > 0,
            },
        });
    }
    next();
});
// Configurar rutas
app.use('/api/payments', payment_routes_1.default);
console.log('💳 [BackMP] Rutas de pagos configuradas en /api/payments');
// Health check mejorado
app.get('/health', (req, res) => {
    console.log('❤️ [BackMP] Health check solicitado');
    const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected', // Aquí se podría verificar realmente
            paymentExpiration: paymentExpirationService.getStatus(),
            audit: 'active',
        },
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    };
    res.json(healthStatus);
});
// Endpoint de métricas para monitoreo
app.get('/metrics', async (req, res) => {
    try {
        const expirationStats = await paymentExpirationService.getExpirationStats();
        const metrics = {
            timestamp: new Date().toISOString(),
            paymentExpiration: expirationStats,
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
            },
        };
        res.json(metrics);
    }
    catch (error) {
        console.error('❌ [BackMP] Error obteniendo métricas:', error);
        res.status(500).json({ error: 'Error obteniendo métricas' });
    }
});
// Socket.IO events con auditoría
io.on('connection', async (socket) => {
    const clientIP = socket.handshake.address;
    console.log(`🔌 [BackMP] Cliente conectado - Socket ID: ${socket.id}, IP: ${clientIP}`);
    // Auditar conexión
    await auditService.logAuditEvent({
        timestamp: new Date().toISOString(),
        userId: 'socket-client',
        action: 'socket.connect',
        resource: 'websocket',
        ip: clientIP,
        userAgent: socket.handshake.headers['user-agent'] || 'unknown',
        success: true,
        details: {
            socketId: socket.id,
            transport: socket.conn.transport.name,
        },
    });
    socket.on('disconnect', async (reason) => {
        console.log(`🔌 [BackMP] Cliente desconectado - Socket ID: ${socket.id}, Razón: ${reason}`);
        // Auditar desconexión
        await auditService.logAuditEvent({
            timestamp: new Date().toISOString(),
            userId: 'socket-client',
            action: 'socket.disconnect',
            resource: 'websocket',
            ip: clientIP,
            userAgent: socket.handshake.headers['user-agent'] || 'unknown',
            success: true,
            details: {
                socketId: socket.id,
                reason,
            },
        });
    });
    socket.on('error', async (error) => {
        console.error(`🔌 [BackMP] Error en socket ${socket.id}:`, error);
        // Auditar error
        await auditService.logAuditEvent({
            timestamp: new Date().toISOString(),
            userId: 'socket-client',
            action: 'socket.error',
            resource: 'websocket',
            ip: clientIP,
            userAgent: socket.handshake.headers['user-agent'] || 'unknown',
            success: false,
            details: {
                socketId: socket.id,
                error: error.message,
            },
        });
    });
});
// Error handler global con auditoría
app.use(async (err, req, res, next) => {
    const requestInfo = (0, security_utils_1.extractRequestInfo)(req);
    console.error('❌ [BackMP] Error global capturado:', err);
    // Auditar error
    await auditService.logAuditEvent({
        timestamp: requestInfo.timestamp,
        userId: req.user?.id || 'anonymous',
        action: 'error.global',
        resource: req.path,
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        success: false,
        details: {
            error: err.message,
            stack: err.stack?.substring(0, 500), // Limitar stack trace
            statusCode: err.statusCode || 500,
        },
    });
    // Respuesta de error sin exponer detalles internos
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message;
    res.status(statusCode).json({
        error: message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
    });
});
// Iniciar servidor
const startServer = async () => {
    try {
        console.log('🔄 [BackMP] Iniciando conexión a base de datos...');
        // Conectar a la base de datos
        await database_1.AppDataSource.initialize();
        console.log('📦 [BackMP] ✅ Database connection initialized');
        // Iniciar servicio de expiración de pagos
        console.log('⏰ [BackMP] Iniciando servicio de expiración de pagos...');
        paymentExpirationService.start();
        console.log('✅ [BackMP] Servicio de expiración iniciado');
        // Iniciar servidor HTTP con Socket.IO
        httpServer.listen(config_1.config.port, () => {
            console.log('=================================');
            console.log(`🚀 [BackMP] ✅ Server running on port ${config_1.config.port}`);
            console.log(`🔌 [BackMP] ✅ Socket.IO enabled`);
            console.log(`🛡️ [BackMP] ✅ Security measures active`);
            console.log(`⏰ [BackMP] ✅ Payment expiration service running`);
            console.log(`🔧 [BackMP] Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 [BackMP] URL: http://localhost:${config_1.config.port}`);
            console.log(`❤️ [BackMP] Health check: http://localhost:${config_1.config.port}/health`);
            console.log(`📊 [BackMP] Metrics: http://localhost:${config_1.config.port}/metrics`);
            console.log('=================================');
        });
    }
    catch (error) {
        console.error('❌ [BackMP] Error starting server:', error);
        console.error('❌ [BackMP] Stack trace:', error.stack);
        process.exit(1);
    }
};
// Manejo de señales de terminación con limpieza
process.on('SIGTERM', async () => {
    console.log('🛑 [BackMP] SIGTERM received. Shutting down gracefully...');
    // Detener servicio de expiración
    paymentExpirationService.stop();
    console.log('⏰ [BackMP] Payment expiration service stopped');
    httpServer.close(() => {
        console.log('💤 [BackMP] Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('🛑 [BackMP] SIGINT received. Shutting down gracefully...');
    // Detener servicio de expiración
    paymentExpirationService.stop();
    console.log('⏰ [BackMP] Payment expiration service stopped');
    httpServer.close(() => {
        console.log('💤 [BackMP] Server closed');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map