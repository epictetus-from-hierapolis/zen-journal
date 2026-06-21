export function HandleError(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            console.error(`[${propertyKey}] failed:`, error);
            throw error;
        }
    };
    return descriptor;
}