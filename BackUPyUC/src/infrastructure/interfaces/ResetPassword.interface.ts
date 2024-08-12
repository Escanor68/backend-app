export interface ResetPasswordObject {
    userId: number;
    token: string;
    expiateToken: Date;
}
