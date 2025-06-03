export interface PaymentPreferenceData {
    items: Array<{
        title: string;
        quantity: number;
        currency_id: string;
        unit_price: number;
    }>;
    payer: {
        email: string;
    };
}

export interface PaymentWebhookData {
    payment_id: string;
    status: string;
    external_reference: string;
    preference_id: string;
}

export interface PaymentStatus {
    id: string;
    status: string;
    detail: string;
    preferenceId?: string;
    mercadoPagoId?: string;
}

export interface RefundResult {
    id: string;
    payment_id: string;
    amount: number;
    status: string;
    date_created: string;
}
