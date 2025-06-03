"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentEvents = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const database_1 = require("./config/database");
const config_1 = require("./config");
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const paymentEvents_1 = require("./events/paymentEvents");
Object.defineProperty(exports, "paymentEvents", { enumerable: true, get: function () { return paymentEvents_1.paymentEvents; } });
console.log('🚀 [BackMP] Iniciando aplicación de pagos...');
// Crear aplicación Express y servidor HTTP
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
console.log('📱 [BackMP] Express app y servidor HTTP creados');
// Configurar Socket.IO
const io = new socket_io_1.Server(httpServer, config_1.config.socket);
exports.io = io;
console.log('🔌 [BackMP] Socket.IO configurado con opciones:', config_1.config.socket);
// Configurar middlewares básicos
app.use((0, cors_1.default)(config_1.config.cors));
console.log('🌐 [BackMP] CORS configurado:', config_1.config.cors);
app.use(express_1.default.json());
console.log('📄 [BackMP] Middleware JSON configurado');
// Middleware de logging para todas las requests
app.use((req, res, next) => {
    console.log(`📡 [BackMP] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')?.substring(0, 50)}...`);
    console.log(`🔍 [BackMP] Request body:`, req.body);
    console.log(`🔍 [BackMP] Request query:`, req.query);
    next();
});
// Configurar rutas
app.use('/api/payments', payment_routes_1.default);
console.log('💳 [BackMP] Rutas de pagos configuradas en /api/payments');
// Health check
app.get('/health', (req, res) => {
    console.log('❤️ [BackMP] Health check solicitado');
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Socket.IO events
io.on('connection', (socket) => {
    console.log(`🔌 [BackMP] Cliente conectado - Socket ID: ${socket.id}`);
    socket.on('disconnect', (reason) => {
        console.log(`🔌 [BackMP] Cliente desconectado - Socket ID: ${socket.id}, Razón: ${reason}`);
    });
    socket.on('error', (error) => {
        console.error(`🔌 [BackMP] Error en socket ${socket.id}:`, error);
    });
});
// Iniciar servidor
const startServer = async () => {
    try {
        console.log('🔄 [BackMP] Iniciando conexión a base de datos...');
        // Conectar a la base de datos
        await database_1.AppDataSource.initialize();
        console.log('📦 [BackMP] ✅ Database connection initialized');
        // Iniciar servidor HTTP con Socket.IO
        httpServer.listen(config_1.config.port, () => {
            console.log('=================================');
            console.log(`🚀 [BackMP] ✅ Server running on port ${config_1.config.port}`);
            console.log(`🔌 [BackMP] ✅ Socket.IO enabled`);
            console.log(`🔧 [BackMP] Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 [BackMP] URL: http://localhost:${config_1.config.port}`);
            console.log(`❤️ [BackMP] Health check: http://localhost:${config_1.config.port}/health`);
            console.log('=================================');
        });
    }
    catch (error) {
        console.error('❌ [BackMP] Error starting server:', error);
        console.error('❌ [BackMP] Stack trace:', error.stack);
        process.exit(1);
    }
};
// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('🛑 [BackMP] SIGTERM received. Shutting down gracefully...');
    httpServer.close(() => {
        console.log('💤 [BackMP] Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('🛑 [BackMP] SIGINT received. Shutting down gracefully...');
    httpServer.close(() => {
        console.log('💤 [BackMP] Server closed');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map