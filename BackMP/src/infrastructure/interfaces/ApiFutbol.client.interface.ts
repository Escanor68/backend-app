export interface ApiFutbolClientInterface {
    sendPaymentInfo(paymentData: any): Promise<void>;
}
