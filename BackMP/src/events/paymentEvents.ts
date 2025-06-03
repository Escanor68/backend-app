import { EventEmitter } from 'events';

interface PaymentEventData {
    paymentId: string;
    status: string;
    timestamp?: Date;
    metadata?: any;
}

interface RefundEventData {
    paymentId: string;
    status: string;
    timestamp?: Date;
    amount?: number;
    reason?: string;
}

class PaymentEvents extends EventEmitter {
    constructor() {
        super();
        console.log(
            '🎪 [PaymentEvents] Sistema de eventos de pago inicializado',
        );
    }

    // Emitir evento de actualización de estado de pago
    emitPaymentStatusUpdate(
        paymentId: string,
        status: string,
        metadata?: any,
    ): void {
        console.log(
            `📢 [PaymentEvents] Emitiendo evento: payment-status-update para pago ${paymentId} con estado ${status}`,
        );

        const eventData: PaymentEventData = {
            paymentId,
            status,
            timestamp: new Date(),
            metadata,
        };

        this.emit('payment-status-update', eventData);
        this.emit(`payment-${paymentId}-status-update`, eventData);
    }

    // Emitir evento de actualización de reembolso
    emitRefundUpdate(
        paymentId: string,
        status: string,
        amount?: number,
        reason?: string,
    ): void {
        console.log(
            `📢 [PaymentEvents] Emitiendo evento: refund-update para pago ${paymentId} con estado ${status}`,
        );

        const eventData: RefundEventData = {
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
    emitPaymentCreated(paymentId: string, metadata?: any): void {
        console.log(
            `📢 [PaymentEvents] Emitiendo evento: payment-created para pago ${paymentId}`,
        );

        const eventData: PaymentEventData = {
            paymentId,
            status: 'created',
            timestamp: new Date(),
            metadata,
        };

        this.emit('payment-created', eventData);
    }

    // Emitir evento de pago completado
    emitPaymentCompleted(paymentId: string, metadata?: any): void {
        console.log(
            `📢 [PaymentEvents] Emitiendo evento: payment-completed para pago ${paymentId}`,
        );

        const eventData: PaymentEventData = {
            paymentId,
            status: 'completed',
            timestamp: new Date(),
            metadata,
        };

        this.emit('payment-completed', eventData);
    }

    // Emitir evento de pago fallido
    emitPaymentFailed(paymentId: string, reason?: string): void {
        console.log(
            `📢 [PaymentEvents] Emitiendo evento: payment-failed para pago ${paymentId}. Razón: ${
                reason || 'No especificada'
            }`,
        );

        const eventData: PaymentEventData = {
            paymentId,
            status: 'failed',
            timestamp: new Date(),
            metadata: { reason },
        };

        this.emit('payment-failed', eventData);
    }

    // Método para suscribirse a eventos de un pago específico
    onPaymentStatusUpdate(
        paymentId: string,
        callback: (data: PaymentEventData) => void,
    ): void {
        console.log(
            `👂 [PaymentEvents] Suscribiéndose a eventos de pago ${paymentId}`,
        );
        this.on(`payment-${paymentId}-status-update`, callback);
    }

    // Método para suscribirse a eventos de reembolso de un pago específico
    onRefundUpdate(
        paymentId: string,
        callback: (data: RefundEventData) => void,
    ): void {
        console.log(
            `👂 [PaymentEvents] Suscribiéndose a eventos de reembolso de pago ${paymentId}`,
        );
        this.on(`payment-${paymentId}-refund-update`, callback);
    }
}

// Crear instancia singleton
export const paymentEvents = new PaymentEvents();

// Configurar listeners por defecto para logging
paymentEvents.on('payment-status-update', (data: PaymentEventData) => {
    console.log(`📊 [PaymentEvents] Estado de pago actualizado:`, data);
});

paymentEvents.on('refund-update', (data: RefundEventData) => {
    console.log(`💰 [PaymentEvents] Reembolso actualizado:`, data);
});

paymentEvents.on('payment-created', (data: PaymentEventData) => {
    console.log(`🆕 [PaymentEvents] Pago creado:`, data);
});

paymentEvents.on('payment-completed', (data: PaymentEventData) => {
    console.log(`✅ [PaymentEvents] Pago completado:`, data);
});

paymentEvents.on('payment-failed', (data: PaymentEventData) => {
    console.log(`❌ [PaymentEvents] Pago fallido:`, data);
});

export { PaymentEvents };
export type { PaymentEventData, RefundEventData };
