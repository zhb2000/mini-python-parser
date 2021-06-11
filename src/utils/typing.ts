type Optional<T> = T | undefined;

type Constructor<T> = new (...args: any[]) => T;

function throwErr<E extends Error>(
    ErrorType: Constructor<E>, ...args: any[]): never {
    throw new ErrorType(...args);
}

function asNonNull<T>(obj: T | undefined | null): T {
    return obj ?? throwErr(Error, 'Null check failed.');
}

export { Optional, Constructor, throwErr, asNonNull };
