export enum PaymentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
    EXPIRED = 'expired',
}

export interface RefundHistory {
    id: string;
    status: string;
    reason: string;
    amount: number;
    date: Date;
    mercadoPagoRefundId?: string;
    metadata?: any;
}

export interface PaymentExtension {
    id: string;
    requestedAt: Date;
    grantedAt?: Date;
    expiresAt: Date;
    reason?: string;
    grantedBy?: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface PaymentMetadata {
    transactionId?: string;
    paymentMethodId?: string;
    paymentTypeId?: string;
    statusDetail?: string;
    externalReference?: string;
    description?: string;
    lastWebhookUpdate?: Date;
    reservationConfirmed?: boolean;
    reservationReleased?: boolean;
    confirmedAt?: Date;
    releasedAt?: Date;
    paymentInfo?: any;
    userEmail?: string;
    userName?: string;
    lastRefundUpdate?: Date;
    refundHistory?: RefundHistory[];
    expiredAt?: Date;
    extensions?: PaymentExtension[];
}
