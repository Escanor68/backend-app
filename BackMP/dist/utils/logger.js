"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.createLogger = exports.logger = void 0;
const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
};
class Logger {
    constructor(context = 'App') {
        this.context = context;
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
        console.log(`🔍 [Logger] ${prefix} ${message}`, ...args);
    }
    error(message, ...args) {
        console.error(`❌ [Logger] [${this.context}] ${message}`, ...args);
    }
    warn(message, ...args) {
        console.warn(`⚠️ [Logger] [${this.context}] ${message}`, ...args);
    }
    info(message, ...args) {
        console.log(`ℹ️ [Logger] [${this.context}] ${message}`, ...args);
    }
    debug(message, ...args) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🐛 [Logger] [${this.context}] ${message}`, ...args);
        }
    }
    log(message, ...args) {
        console.log(`📋 [Logger] [${this.context}] ${message}`, ...args);
    }
}
exports.Logger = Logger;
// Instancia por defecto
exports.logger = new Logger('BackMP');
// Función para crear loggers con contexto específico
const createLogger = (context) => new Logger(context);
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map