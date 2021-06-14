type Optional<T> = T | undefined;

type Constructor<T> = new (...args: any[]) => T;

/** 实现类似 C# 中 throw 表达式的效果 */
function throwErr<E extends Error>(
    ErrorType: Constructor<E>, ...args: any[]): never {
    throw new ErrorType(...args);
}

/** 将可空引用转为非空引用，失败则抛异常 */
function asNonNull<T>(obj: T | undefined | null): T {
    return obj ?? throwErr(Error, 'Null check failed.');
}

/** 会抛异常的断言函数（与 `console.assert` 不同） */
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
