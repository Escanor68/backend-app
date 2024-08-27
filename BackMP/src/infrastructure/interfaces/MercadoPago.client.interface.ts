export interface MercadoPagoClientInterface {
    createOrder(paymentData: any): Promise<any>;
    receiveWebhook(payment: any): Promise<any>;
    getPaymentMethod(): Promise<Array<object>>;
}
