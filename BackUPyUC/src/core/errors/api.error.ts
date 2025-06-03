import { HttpStatus } from '../constants';

export class ApiError extends Error {
    public readonly status: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        status: number = HttpStatus.INTERNAL_SERVER_ERROR,
        isOperational: boolean = true,
        stack: string = '',
    ) {
        super(message);

        console.log('❌ [ApiError] Creando error API:', {
            message,
            status,
            isOperational,
        });

        this.name = 'ApiError';
        this.status = status;
        this.isOperational = isOperational;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static badRequest(message: string = 'Bad Request'): ApiError {
        console.log('⚠️ [ApiError] Error de bad request:', message);
        return new ApiError(message, HttpStatus.BAD_REQUEST);
    }

    static unauthorized(message: string = 'Unauthorized'): ApiError {
        console.log('🔐 [ApiError] Error de autorización:', message);
        return new ApiError(message, HttpStatus.UNAUTHORIZED);
    }

    static forbidden(message: string = 'Forbidden'): ApiError {
        console.log('🚫 [ApiError] Error de permisos:', message);
        return new ApiError(message, HttpStatus.FORBIDDEN);
    }

    static notFound(message: string = 'Not Found'): ApiError {
        console.log('🔍 [ApiError] Error de recurso no encontrado:', message);
        return new ApiError(message, HttpStatus.NOT_FOUND);
    }

    static conflict(message: string = 'Conflict'): ApiError {
        console.log('⚡ [ApiError] Error de conflicto:', message);
        return new ApiError(message, HttpStatus.CONFLICT);
    }

    static unprocessableEntity(
        message: string = 'Unprocessable Entity',
    ): ApiError {
        console.log('📝 [ApiError] Error de validación:', message);
        return new ApiError(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    static internalServer(message: string = 'Internal Server Error'): ApiError {
        console.log('💥 [ApiError] Error interno del servidor:', message);
        return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            isOperational: this.isOperational,
            stack: this.stack,
        };
    }
}
