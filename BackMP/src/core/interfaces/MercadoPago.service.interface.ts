interface WebhookEvent {
    // Revisar los valores de llegada
}

export interface MercadoPagoServiceInterface {
    createPayment(paymentData: any): Promise<any>;
    webhookReceive(webhookEvent: WebhookEvent): Promise<void>;
    updateRecordAndSendInfo(recordId: string, updatedData: any): Promise<void>;
}
