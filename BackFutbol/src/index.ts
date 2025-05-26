import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

import k8sRoutes from './routes/k8s';
import routesservice from './routes/routesservice';

import NotFoundController from './api/controller/NotFound.controller';
import InternalErrorController from './api/controller/InternalError.controller';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 peticiones por ventana
});

// Middleware
app.use(limiter);
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Routes
app.use(k8sRoutes);
app.use(routesservice);

// Error handling
app.use(NotFoundController);
app.use(InternalErrorController);

// Socket.IO events
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
export { io };
