interface LogLevel {
    ERROR: 'error';
    WARN: 'warn';
    INFO: 'info';
    DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
};

class Logger {
    private context: string;

    constructor(context: string = 'App') {
        this.context = context;
    }

    private formatMessage(
        level: string,
        message: string,
        ...args: any[]
    ): void {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [${
            this.context
        }]`;

        console.log(`🔍 [Logger] ${prefix} ${message}`, ...args);
    }

    error(message: string, ...args: any[]): void {
        console.error(`❌ [Logger] [${this.context}] ${message}`, ...args);
    }

    warn(message: string, ...args: any[]): void {
        console.warn(`⚠️ [Logger] [${this.context}] ${message}`, ...args);
    }

    info(message: string, ...args: any[]): void {
        console.log(`ℹ️ [Logger] [${this.context}] ${message}`, ...args);
    }

    debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🐛 [Logger] [${this.context}] ${message}`, ...args);
        }
    }

    log(message: string, ...args: any[]): void {
        console.log(`📋 [Logger] [${this.context}] ${message}`, ...args);
    }
}

// Instancia por defecto
export const logger = new Logger('BackMP');

// Función para crear loggers con contexto específico
export const createLogger = (context: string) => new Logger(context);

// Exportar la clase para uso avanzado
export { Logger };
