import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './config/database';
import { config } from './config';
import paymentRoutes from './routes/payment.routes';
import { paymentEvents } from './events/paymentEvents';

console.log('🚀 [BackMP] Iniciando aplicación de pagos...');

// Crear aplicación Express y servidor HTTP
const app = express();
const httpServer = createServer(app);

console.log('📱 [BackMP] Express app y servidor HTTP creados');

// Configurar Socket.IO
const io = new Server(httpServer, config.socket);
console.log('🔌 [BackMP] Socket.IO configurado con opciones:', config.socket);

// Configurar middlewares básicos
app.use(cors(config.cors));
console.log('🌐 [BackMP] CORS configurado:', config.cors);

app.use(express.json());
console.log('📄 [BackMP] Middleware JSON configurado');

// Middleware de logging para todas las requests
app.use((req, res, next) => {
    console.log(
        `📡 [BackMP] ${req.method} ${req.path} - IP: ${
            req.ip
        } - User-Agent: ${req.get('User-Agent')?.substring(0, 50)}...`,
    );
    console.log(`🔍 [BackMP] Request body:`, req.body);
    console.log(`🔍 [BackMP] Request query:`, req.query);
    next();
});

// Configurar rutas
app.use('/api/payments', paymentRoutes);
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
        console.log(
            `🔌 [BackMP] Cliente desconectado - Socket ID: ${socket.id}, Razón: ${reason}`,
        );
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
        await AppDataSource.initialize();
        console.log('📦 [BackMP] ✅ Database connection initialized');

        // Iniciar servidor HTTP con Socket.IO
        httpServer.listen(config.port, () => {
            console.log('=================================');
            console.log(`🚀 [BackMP] ✅ Server running on port ${config.port}`);
            console.log(`🔌 [BackMP] ✅ Socket.IO enabled`);
            console.log(`🔧 [BackMP] Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 [BackMP] URL: http://localhost:${config.port}`);
            console.log(
                `❤️ [BackMP] Health check: http://localhost:${config.port}/health`,
            );
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ [BackMP] Error starting server:', error);
        console.error('❌ [BackMP] Stack trace:', (error as Error).stack);
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

export { io, paymentEvents };
