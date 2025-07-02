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
import cookieParser from 'cookie-parser';
import { TokenCleanupService } from './services/token-cleanup.service';

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
        origin: ['http://localhost:3001'],
        methods: ['GET', 'POST'],
    },
});
console.log('🔌 [BackUPyUC] Socket.IO configurado');

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
});
console.log('🚦 [BackUPyUC] Rate limiting configurado');

// Middleware
app.use(limiter);
app.use(
    cors({
        origin: ['http://localhost:3001', 'http://localhost:4000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);
console.log('🌐 [BackUPyUC] CORS configurado');

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

console.log('🛡️ [BackUPyUC] Middleware de seguridad aplicado');

// Protección CSRF (excepto en rutas de API y GET)
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health' || req.path.startsWith('/api-docs')) {
        return next();
    }
    return csrf({
        cookie: {
            key: '_csrf',
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        },
        ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    })(req, res, next);
});
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

// Configuración de Winston para logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
});

// Middleware de logging
app.use(((req: Request, _res: Response, next: NextFunction): void => {
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
app.use('/api', routes);
console.log('🛣️ [BackUPyUC] Rutas API configuradas en /api');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Middleware 404
app.use(notFoundHandler as RequestHandler);
console.log('🔍 [BackUPyUC] Middleware 404 configurado');

// Middleware de manejo de errores
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
    console.log('🛑 [BackUPyUC] SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('💤 [BackUPyUC] HTTP server closed');
        process.exit(0);
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;

// Inicializar servicio de limpieza de tokens
const tokenCleanupService = new TokenCleanupService();
tokenCleanupService.startCleanup(60); // Limpiar cada hora

server.listen(PORT, () => {
    console.log(`🚀 [BackUPyUC] Servidor iniciado en puerto ${PORT}`);
    console.log(`🌐 [BackUPyUC] URL: http://localhost:${PORT}`);
    console.log(`📚 [BackUPyUC] API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`❤️ [BackUPyUC] Health Check: http://localhost:${PORT}/health`);
    console.log(`🧹 [BackUPyUC] Token cleanup service iniciado`);
});

export default app;
export { io };
