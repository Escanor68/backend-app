export interface MercadoPagoClientInterface {
    createPayment(paymentData: any): Promise<any>;
}
