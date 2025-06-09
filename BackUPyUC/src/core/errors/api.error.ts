import { HttpStatus } from '../constants';

export class ApiError extends Error {
    constructor(message: string, public statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR) {
        super(message);
        this.name = 'ApiError';
    }

    static badRequest(message: string = 'Bad Request'): ApiError {
        return new ApiError(message, HttpStatus.BAD_REQUEST);
    }

    static unauthorized(message: string = 'Unauthorized'): ApiError {
        return new ApiError(message, HttpStatus.UNAUTHORIZED);
    }

    static forbidden(message: string = 'Forbidden'): ApiError {
        return new ApiError(message, HttpStatus.FORBIDDEN);
    }

    static notFound(message: string = 'Not Found'): ApiError {
        return new ApiError(message, HttpStatus.NOT_FOUND);
    }

    static conflict(message: string = 'Conflict'): ApiError {
        return new ApiError(message, HttpStatus.CONFLICT);
    }

    static unprocessableEntity(message: string = 'Unprocessable Entity'): ApiError {
        return new ApiError(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    static internalServer(message: string = 'Internal Server Error'): ApiError {
        return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.statusCode,
        };
    }
}
