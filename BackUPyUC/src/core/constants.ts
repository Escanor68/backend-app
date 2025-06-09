export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = '24h';

export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
} as const;

export const Roles = {
    ADMIN: 'admin',
    USER: 'user',
} as const;

export const JWT = {
    ALGORITHM: 'HS256',
    REFRESH_EXPIRES_IN: '7d',
};

export const ROLES = {
    MANAGER: 'manager',
} as const;

export const RESOURCES = {
    USER: 'user',
    FIELD: 'field',
    BOOKING: 'booking',
    PAYMENT: 'payment',
} as const;

export const ACTIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    LOGIN: 'login',
    LOGOUT: 'logout',
    RESET_PASSWORD: 'reset_password',
} as const;

export const PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
};

export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s\-()]+$/,
};

export const CACHE = {
    USER_TTL: 300, // 5 minutes
    DEFAULT_TTL: 60, // 1 minute
};

export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
};

export const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

console.log('📋 [Constants] Constantes del sistema cargadas');
console.log('🔧 [Constants] HTTP Status codes, JWT config, roles, etc. disponibles');
