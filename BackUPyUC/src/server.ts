import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import csrf from 'csurf';
import winston from 'winston';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { setupDatabase } from './config/database';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

// Configuración de variables de entorno
dotenv.config();

// Configuración de Winston para logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// Inicialización de Express y HTTP server
const app = express();
const server = createServer(app);

// Configuración de Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
    },
});

// Configuración de rate limiting
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});

// Middleware básico
app.use(limiter);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Middleware de logging
app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info({
        message: 'Request recibida',
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query,
    });
    next();
});

// Documentación Swagger
if (process.env.NODE_ENV !== 'production') {
    const swaggerDocument = require('../swagger.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`${apiPrefix}/${apiVersion}/users`, userRoutes);
app.use(`${apiPrefix}/${apiVersion}/auth`, authRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// CSRF Protection
app.use(
    csrf({
        cookie: false,
        ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    })
);

// CSRF Token middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

// Socket.IO events
io.on('connection', (socket: Socket) => {
    logger.info(`Cliente conectado - Socket ID: ${socket.id}`);

    socket.on('disconnect', (reason: string) => {
        logger.info(`Cliente desconectado - Socket ID: ${socket.id}, Razón: ${reason}`);
    });

    socket.on('error', (error: Error) => {
        logger.error(`Error en socket ${socket.id}:`, error);
    });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} recibido. Cerrando servidor...`);
    server.close(() => {
        logger.info('Servidor cerrado');
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Inicialización del servidor
const startServer = async () => {
    try {
        await setupDatabase();
        logger.info('Base de datos inicializada correctamente');

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            logger.info(`Servidor iniciado en puerto ${PORT}`);
            logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

export { app, server, startServer };
