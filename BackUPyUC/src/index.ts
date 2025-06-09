import cors from 'cors';
import express, {
    Request,
    Response,
    NextFunction,
    ErrorRequestHandler,
    RequestHandler,
} from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import csrf from 'csurf';
import winston from 'winston';
import { startServer } from './server';

dotenv.config();
console.log('🚀 [BackUPyUC] Iniciando aplicación de usuarios...');

import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { setupDatabase } from './config/database';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

// Extender la interfaz Request de Express para incluir csrfToken
declare global {
    namespace Express {
        interface Request {
            csrfToken(): string;
        }
    }
}

const app = express();
const server = createServer(app);
console.log('📱 [BackUPyUC] Express app y servidor HTTP creados');

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
    },
});
console.log('🔌 [BackUPyUC] Socket.IO configurado - Origin:', process.env.CORS_ORIGIN || '*');

// Rate limiting
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});
console.log(
    '🚦 [BackUPyUC] Rate limiting configurado - Window:',
    Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    'ms, Max requests:',
    Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

// Middleware
app.use(limiter);
console.log('🚦 [BackUPyUC] Rate limiter aplicado');

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);
console.log('🌐 [BackUPyUC] CORS configurado - Origin:', process.env.CORS_ORIGIN || '*');

app.use(helmet());
console.log('🛡️ [BackUPyUC] Helmet (seguridad) aplicado');

app.use(compression());
console.log('🗜️ [BackUPyUC] Compresión aplicada');

app.use(express.json({ limit: '10mb' }));
console.log('📄 [BackUPyUC] JSON parser configurado con límite de 10mb');

app.use(express.urlencoded({ extended: false }));
console.log('📝 [BackUPyUC] URL encoded parser configurado');

// Protección CSRF (excepto en rutas públicas y GET)
app.use(
    csrf({
        cookie: {
            key: '_csrf',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        },
        ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    })
);
console.log('🛡️ [BackUPyUC] CSRF protection configurado');

// Para exponer el token CSRF en las respuestas
app.use((_req, res, next) => {
    if (_req.csrfToken) {
        res.cookie('XSRF-TOKEN', _req.csrfToken(), {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
    }
    next();
});

// Configuración de Winston para logging estructurado
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        // Puedes agregar aquí un archivo o transporte externo
    ],
});

// Middleware de logging usando Winston
app.use(((req: Request, res: Response, next: NextFunction): void => {
    logger.info({
        message: 'Request recibida',
        method: req.method,
        path: req.path,
        ip: req.ip,
    });
    next();
}) as RequestHandler);

// API Documentation
if (process.env.NODE_ENV !== 'production') {
    const swaggerDocument = require('../swagger.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log('📚 [BackUPyUC] Swagger UI configurado en /api-docs');
} else {
    console.log('📚 [BackUPyUC] Swagger UI deshabilitado en producción');
}

// Health check
app.get('/health', (_req, res) => {
    console.log('❤️ [BackUPyUC] Health check solicitado');
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
    });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`${apiPrefix}/${apiVersion}`, routes);
console.log(`🛣️ [BackUPyUC] Rutas API configuradas en ${apiPrefix}/${apiVersion}`);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Middleware 404 - Debe ir después de todas las rutas
app.use(notFoundHandler as RequestHandler);
console.log('🔍 [BackUPyUC] Middleware 404 configurado');

// Middleware de manejo de errores - Debe ir al final
app.use(errorHandler as ErrorRequestHandler);
console.log('⚠️ [BackUPyUC] Middleware de manejo de errores configurado');

// Socket.IO events
io.on('connection', (socket: Socket) => {
    console.log(`🔌 [BackUPyUC] Cliente conectado - Socket ID: ${socket.id}`);

    socket.on('disconnect', (reason: string) => {
        console.log(
            `🔌 [BackUPyUC] Cliente desconectado - Socket ID: ${socket.id}, Razón: ${reason}`
        );
    });

    socket.on('error', (error: Error) => {
        console.error(`🔌 [BackUPyUC] Error en socket ${socket.id}:`, error);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 [BackUPyUC] SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('💤 [BackUPyUC] HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 [BackUPyUC] SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('💤 [BackUPyUC] Server closed');
        process.exit(0);
    });
});

// Initialize database
console.log('🔄 [BackUPyUC] Iniciando conexión a base de datos...');
setupDatabase()
    .then(() => {
        console.log('📦 [BackUPyUC] ✅ Base de datos inicializada correctamente');

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 [BackUPyUC] ✅ Server running on port ${PORT}`);
            console.log(`🔧 [BackUPyUC] Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 [BackUPyUC] URL: http://localhost:${PORT}`);
            console.log(`❤️ [BackUPyUC] Health check: http://localhost:${PORT}/health`);
            if (process.env.NODE_ENV !== 'production') {
                console.log(`📚 [BackUPyUC] API Documentation: http://localhost:${PORT}/api-docs`);
            }
            console.log('=================================');
        });
    })
    .catch((error: Error) => {
        console.error('❌ [BackUPyUC] Failed to initialize database:', error);
        console.error('❌ [BackUPyUC] Stack trace:', error.stack);
        process.exit(1);
    });

// Iniciar el servidor
startServer().catch(error => {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
});

export default app;
export { io };
