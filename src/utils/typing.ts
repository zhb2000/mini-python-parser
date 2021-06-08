type Optional<T> = T | undefined;

function throwErr<E extends Error>(
    ErrorType: new (...args: any) => E, ...args: any): never {
    throw new ErrorType(...args);
}

function asNonNull<T>(obj: T | undefined | null): T {
    return obj ?? throwErr(Error, 'Null check failed.');
}

export { Optional, throwErr, asNonNull };
