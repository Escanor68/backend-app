import mysqlDs from '../datasources/mysql.datasource';

export function initializeConnection() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            if (!mysqlDs.isInitialized && process.env.NODE_ENV !== 'test') {
                await mysqlDs.initialize();
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}

export default initializeConnection;
