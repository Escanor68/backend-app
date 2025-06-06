export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public isOperational = true
    ) {
        super(message);
        this.name = 'ApiError';
        Error.captureStackTrace(this, this.constructor);
    }
}
