import mysqlDs from '../datasource/mysql.datasource';

// Función decoradora para inicializar la conexión a la base de datos
export function initializeConnection() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        // Sobrescribir el método original con una función asincrónica
        descriptor.value = async function (...args: any[]) {
            // Verificar si la conexión a la base de datos ya está inicializada y no estamos en entorno de prueba
            if (!mysqlDs.isInitialized && process.env.NODE_ENV !== 'test') {
                // Inicializar la conexión a la base de datos
                await mysqlDs.initialize();
            }
            // Llamar al método original con los argumentos recibidos y devolver el resultado
            return originalMethod.apply(this, args);
        };
        // Devolver el descriptor modificado
        return descriptor;
    };
}

export default initializeConnection;
