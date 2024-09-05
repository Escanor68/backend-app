export interface PaymentDataInterface {
    transaction_amount: number;
    token: string;
    description: string;
    installments: number;
    payment_method_id: string;
    issuer_id: number;
    payer: {
        email: string;
        identification: {
            type: string;
            number: string;
        };
    };
}
