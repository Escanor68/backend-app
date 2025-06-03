import { Server, Socket } from 'socket.io';

export const setupPaymentEvents = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('🔌 Client connected:', socket.id);

        // Evento para unirse a una sala específica de pago
        socket.on('join-payment', (paymentId: string) => {
            socket.join(`payment-${paymentId}`);
            console.log(
                `Client ${socket.id} joined payment room: ${paymentId}`,
            );
        });

        // Evento para dejar una sala de pago
        socket.on('leave-payment', (paymentId: string) => {
            socket.leave(`payment-${paymentId}`);
            console.log(`Client ${socket.id} left payment room: ${paymentId}`);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });

    return {
        // Método para emitir actualizaciones de estado de pago
        emitPaymentStatusUpdate: (paymentId: string, status: any) => {
            io.to(`payment-${paymentId}`).emit('payment-status-update', {
                paymentId,
                status,
                timestamp: new Date().toISOString(),
            });
        },

        // Método para emitir notificaciones de reembolso
        emitRefundUpdate: (paymentId: string, refundStatus: any) => {
            io.to(`payment-${paymentId}`).emit('refund-update', {
                paymentId,
                refundStatus,
                timestamp: new Date().toISOString(),
            });
        },
    };
};
