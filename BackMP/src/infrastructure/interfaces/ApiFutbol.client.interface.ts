export interface ApiFutbolClientInterface {
    sendPaymentCompleted(paymentData: any): Promise<void>;
}
