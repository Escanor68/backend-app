"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEvents = exports.paymentEvents = void 0;
const events_1 = require("events");
class PaymentEvents extends events_1.EventEmitter {
    constructor() {
        super();
        console.log('🎪 [PaymentEvents] Sistema de eventos de pago inicializado');
    }
    // Emitir evento de actualización de estado de pago
    emitPaymentStatusUpdate(paymentId, status, metadata) {
        console.log(`📢 [PaymentEvents] Emitiendo evento: payment-status-update para pago ${paymentId} con estado ${status}`);
        const eventData = {
            paymentId,
            status,
            timestamp: new Date(),
            metadata,
        };
        this.emit('payment-status-update', eventData);
        this.emit(`payment-${paymentId}-status-update`, eventData);
    }
    // Emitir evento de actualización de reembolso
    emitRefundUpdate(paymentId, status, amount, reason) {
        console.log(`📢 [PaymentEvents] Emitiendo evento: refund-update para pago ${paymentId} con estado ${status}`);
        const eventData = {
            paymentId,
            status,
            timestamp: new Date(),
            amount,
            reason,
        };
        this.emit('refund-update', eventData);
        this.emit(`payment-${paymentId}-refund-update`, eventData);
    }
    // Emitir evento de pago creado
    emitPaymentCreated(paymentId, metadata) {
        console.log(`📢 [PaymentEvents] Emitiendo evento: payment-created para pago ${paymentId}`);
        const eventData = {
            paymentId,
            status: 'created',
            timestamp: new Date(),
            metadata,
        };
        this.emit('payment-created', eventData);
    }
    // Emitir evento de pago completado
    emitPaymentCompleted(paymentId, metadata) {
        console.log(`📢 [PaymentEvents] Emitiendo evento: payment-completed para pago ${paymentId}`);
        const eventData = {
            paymentId,
            status: 'completed',
            timestamp: new Date(),
            metadata,
        };
        this.emit('payment-completed', eventData);
    }
    // Emitir evento de pago fallido
    emitPaymentFailed(paymentId, reason) {
        console.log(`📢 [PaymentEvents] Emitiendo evento: payment-failed para pago ${paymentId}. Razón: ${reason || 'No especificada'}`);
        const eventData = {
            paymentId,
            status: 'failed',
            timestamp: new Date(),
            metadata: { reason },
        };
        this.emit('payment-failed', eventData);
    }
    // Método para suscribirse a eventos de un pago específico
    onPaymentStatusUpdate(paymentId, callback) {
        console.log(`👂 [PaymentEvents] Suscribiéndose a eventos de pago ${paymentId}`);
        this.on(`payment-${paymentId}-status-update`, callback);
    }
    // Método para suscribirse a eventos de reembolso de un pago específico
    onRefundUpdate(paymentId, callback) {
        console.log(`👂 [PaymentEvents] Suscribiéndose a eventos de reembolso de pago ${paymentId}`);
        this.on(`payment-${paymentId}-refund-update`, callback);
    }
}
exports.PaymentEvents = PaymentEvents;
// Crear instancia singleton
exports.paymentEvents = new PaymentEvents();
// Configurar listeners por defecto para logging
exports.paymentEvents.on('payment-status-update', (data) => {
    console.log(`📊 [PaymentEvents] Estado de pago actualizado:`, data);
});
exports.paymentEvents.on('refund-update', (data) => {
    console.log(`💰 [PaymentEvents] Reembolso actualizado:`, data);
});
exports.paymentEvents.on('payment-created', (data) => {
    console.log(`🆕 [PaymentEvents] Pago creado:`, data);
});
exports.paymentEvents.on('payment-completed', (data) => {
    console.log(`✅ [PaymentEvents] Pago completado:`, data);
});
exports.paymentEvents.on('payment-failed', (data) => {
    console.log(`❌ [PaymentEvents] Pago fallido:`, data);
});
//# sourceMappingURL=paymentEvents.js.map