export class UnauthorizedError extends Error {
    public status: number;

    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
        this.status = 401;
        Error.captureStackTrace(this, this.constructor);
    }
} 