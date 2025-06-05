import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './config/database';
import { config } from './config';
import paymentRoutes from './routes/payment.routes';
import { paymentEvents } from './events/paymentEvents';
import { PaymentExpirationService } from './services/payment-expiration.service';
import { AuditService } from './services/audit.service';
import { maskSensitiveData, extractRequestInfo } from './utils/security.utils';
import rateLimit from 'express-rate-limit';

console.log('🚀 [BackMP] Iniciando aplicación de pagos...');

// Crear aplicación Express y servidor HTTP
const app = express();
const httpServer = createServer(app);

console.log('📱 [BackMP] Express app y servidor HTTP creados');

// Configurar Socket.IO
const io = new Server(httpServer, config.socket);
console.log('🔌 [BackMP] Socket.IO configurado con opciones:', config.socket);

// Inicializar servicios de seguridad y limpieza
const auditService = new AuditService();
const paymentExpirationService = new PaymentExpirationService(
    parseInt(process.env.PAYMENT_EXPIRATION_MINUTES || '30'), // 30 minutos por defecto
    process.env.CLEANUP_SCHEDULE || '*/5 * * * *', // Cada 5 minutos
);

console.log('🛡️ [BackMP] Servicios de seguridad inicializados');

// Configurar middleware de seguridad PCI DSS
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // límite de 100 solicitudes por ventana
        message: {
            error: 'Demasiadas solicitudes',
            message: 'Por favor, intente más tarde',
        },
        standardHeaders: true,
        legacyHeaders: false,
    }),
);
console.log('🔒 [BackMP] Rate limiting configurado');

// Configurar middlewares básicos
app.use(cors(config.cors));
console.log('🌐 [BackMP] CORS configurado:', config.cors);

app.use(express.json({ limit: '10mb' }));
console.log('📄 [BackMP] Middleware JSON configurado');

// Middleware de logging seguro para todas las requests
app.use(async (req, res, next) => {
    const requestInfo = extractRequestInfo(req);

    // Log seguro sin datos sensibles
    const safeBody = maskSensitiveData(req.body, {
        cardNumber: true,
        cvv: true,
        expirationDate: true,
        email: false, // Permitir email en logs
    });

    console.log(
        `📡 [BackMP] ${req.method} ${req.path} - IP: ${
            requestInfo.ip
        } - User-Agent: ${requestInfo.userAgent.substring(0, 50)}...`,
    );

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
app.use('/api/payments', paymentRoutes);
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
        const expirationStats =
            await paymentExpirationService.getExpirationStats();

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
    } catch (error) {
        console.error('❌ [BackMP] Error obteniendo métricas:', error);
        res.status(500).json({ error: 'Error obteniendo métricas' });
    }
});

// Socket.IO events con auditoría
io.on('connection', async (socket) => {
    const clientIP = socket.handshake.address;
    console.log(
        `🔌 [BackMP] Cliente conectado - Socket ID: ${socket.id}, IP: ${clientIP}`,
    );

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
        console.log(
            `🔌 [BackMP] Cliente desconectado - Socket ID: ${socket.id}, Razón: ${reason}`,
        );

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
app.use(
    async (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const requestInfo = extractRequestInfo(req);

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
        const message =
            process.env.NODE_ENV === 'production'
                ? 'Error interno del servidor'
                : err.message;

        res.status(statusCode).json({
            error: message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
        });
    },
);

// Iniciar servidor
const startServer = async () => {
    try {
        console.log('🔄 [BackMP] Iniciando conexión a base de datos...');

        // Conectar a la base de datos
        await AppDataSource.initialize();
        console.log('📦 [BackMP] ✅ Database connection initialized');

        // Iniciar servicio de expiración de pagos
        console.log('⏰ [BackMP] Iniciando servicio de expiración de pagos...');
        paymentExpirationService.start();
        console.log('✅ [BackMP] Servicio de expiración iniciado');

        // Iniciar servidor HTTP con Socket.IO
        httpServer.listen(config.port, () => {
            console.log('=================================');
            console.log(`🚀 [BackMP] ✅ Server running on port ${config.port}`);
            console.log(`🔌 [BackMP] ✅ Socket.IO enabled`);
            console.log(`🛡️ [BackMP] ✅ Security measures active`);
            console.log(`⏰ [BackMP] ✅ Payment expiration service running`);
            console.log(`🔧 [BackMP] Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 [BackMP] URL: http://localhost:${config.port}`);
            console.log(
                `❤️ [BackMP] Health check: http://localhost:${config.port}/health`,
            );
            console.log(
                `📊 [BackMP] Metrics: http://localhost:${config.port}/metrics`,
            );
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ [BackMP] Error starting server:', error);
        console.error('❌ [BackMP] Stack trace:', (error as Error).stack);
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

export { io, paymentEvents, auditService, paymentExpirationService };
