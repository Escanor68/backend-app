"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPaymentEvents = void 0;
const setupPaymentEvents = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id);
        // Evento para unirse a una sala específica de pago
        socket.on('join-payment', (paymentId) => {
            socket.join(`payment-${paymentId}`);
            console.log(`Client ${socket.id} joined payment room: ${paymentId}`);
        });
        // Evento para dejar una sala de pago
        socket.on('leave-payment', (paymentId) => {
            socket.leave(`payment-${paymentId}`);
            console.log(`Client ${socket.id} left payment room: ${paymentId}`);
        });
        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });
    return {
        // Método para emitir actualizaciones de estado de pago
        emitPaymentStatusUpdate: (paymentId, status) => {
            io.to(`payment-${paymentId}`).emit('payment-status-update', {
                paymentId,
                status,
                timestamp: new Date().toISOString(),
            });
        },
        // Método para emitir notificaciones de reembolso
        emitRefundUpdate: (paymentId, refundStatus) => {
            io.to(`payment-${paymentId}`).emit('refund-update', {
                paymentId,
                refundStatus,
                timestamp: new Date().toISOString(),
            });
        },
    };
};
exports.setupPaymentEvents = setupPaymentEvents;
//# sourceMappingURL=payment.events.js.map