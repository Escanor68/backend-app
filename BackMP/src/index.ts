import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createConnection } from 'typeorm';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Importación de rutas
import authRoutes from './routes/auth.routes';
import paymentRoutes from './routes/payment.routes';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configuración de Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Configuración de rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
});

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(limiter);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Inicialización de la base de datos y servidor
const startServer = async () => {
    try {
        // Conexión a la base de datos
        await createConnection({
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'mp_db',
            entities: [__dirname + '/core/entities/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV === 'development', // Solo en desarrollo
            logging: process.env.NODE_ENV === 'development'
        });

        console.log('📦 Database connection established');

        // Configuración de Socket.IO
        io.on('connection', (socket) => {
            console.log('🔌 Client connected:', socket.id);
            
            socket.on('disconnect', () => {
                console.log('🔌 Client disconnected:', socket.id);
            });
        });

        // Iniciar servidor
        const PORT = process.env.PORT || 3000;
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
        });

    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    httpServer.close(() => {
        console.log('💤 Server closed');
        process.exit(0);
    });
});

startServer();
