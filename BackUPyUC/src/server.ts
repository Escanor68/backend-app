import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { initializeDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { rateLimiter } from './middleware/rate-limiter.middleware';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimiter);

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Manejadores de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
export async function startServer() {
    try {
        // Inicializar base de datos
        await initializeDatabase();

        // Iniciar servidor HTTP
        const port = config.server.port;
        app.listen(port, () => {
            console.log(`🚀 [Server] Servidor iniciado en http://localhost:${port}`);
            console.log(`🌍 [Server] Entorno: ${config.server.nodeEnv}`);
        });
    } catch (error) {
        console.error('❌ [Server] Error al iniciar el servidor:', error);
        process.exit(1);
    }
}
