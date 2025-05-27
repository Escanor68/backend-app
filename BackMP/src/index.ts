import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from './config/database';
import { config } from './config';
import paymentRoutes from './routes/payment.routes';

// Crear aplicación Express y servidor HTTP
const app = express();
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new Server(httpServer, config.socket);

// Configurar middlewares básicos
app.use(cors(config.cors));
app.use(express.json());

// Configurar rutas
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await AppDataSource.initialize();
    console.log('📦 Database connection initialized');

    // Iniciar servidor HTTP con Socket.IO
    httpServer.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`🔌 Socket.IO enabled`);
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
