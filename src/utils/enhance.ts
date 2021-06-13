type Optional<T> = T | undefined;

type Constructor<T> = new (...args: any[]) => T;

function throwErr<E extends Error>(
    ErrorType: Constructor<E>, ...args: any[]): never {
    throw new ErrorType(...args);
}

function asNonNull<T>(obj: T | undefined | null): T {
    return obj ?? throwErr(Error, 'Null check failed.');
}

function assert(value: any, message?: string) {
    if (!value) {
        const msg = (message != null)
            ? `Assertion failed: ${message}`
            : 'Assertion failed';
        throw new Error(msg);
    }
}

export {
    Optional,
    Constructor,
    throwErr,
    asNonNull,
    assert
};
