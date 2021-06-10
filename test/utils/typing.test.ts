import { throwErr, asNonNull } from '../../src/utils/typing';

test('throwErr test 1', () => {
    expect(() => throwErr(Error, 'msg')).toThrowError('msg');
});

test('asNonNull test 1', () => {
    const a = 123;
    expect(asNonNull(a)).toBe(a);
});

test('throwErr test 2', () => {
    expect(() => asNonNull(undefined)).toThrow();
});

test('throwErr test 3', () => {
    expect(() => asNonNull(null)).toThrow();
});