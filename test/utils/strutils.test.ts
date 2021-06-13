import { isEmpty, isString, isdigit, isalpha } from '../../src/utils/strutils';

//#region isEmpty
test('isEmpty test 1', () => {
    expect(isEmpty(null)).toEqual(true);
});

test('isEmpty test 2', () => {
    expect(isEmpty(undefined)).toEqual(true);
});

test('isEmpty test 3', () => {
    expect(isEmpty('')).toEqual(true);
});

test('isEmpty test 4', () => {
    expect(isEmpty('   ')).toEqual(false);
});
//#endregion

//#region isString
test('isString test 1', () => {
    expect(isString('')).toEqual(true);
});

test('isString test 2', () => {
    expect(isString('abcd')).toEqual(true);
});

test('isString test 3', () => {
    expect(isString(new String())).toEqual(true);
});

test('isString test 4', () => {
    expect(isString(new String('abcd'))).toEqual(true);
});

test('isString test 5', () => {
    expect(isString(undefined)).toEqual(false);
});

test('isString test 6', () => {
    expect(isString(null)).toEqual(false);
});

test('isString test 7', () => {
    expect(isString([])).toEqual(false);
});
//#endregion

//#region isdigit
test('isdigit test 1', () => {
    expect(isdigit('0')).toEqual(true);
});

test('isdigit test 2', () => {
    expect(isdigit('9')).toEqual(true);
});

test('isdigit test 3', () => {
    expect(() => isdigit('235')).toThrow();
});

test('isdigit test 4', () => {
    expect(isdigit('a')).toEqual(false);
});
//#endregion

//#region isalpha
test('isalpha test 1', () => {
    expect(isalpha('a')).toEqual(true);
});

test('isalpha test 2', () => {
    expect(isalpha('A')).toEqual(true);
});

test('isalpha test 3', () => {
    expect(isalpha('z')).toEqual(true);
});

test('isalpha test 4', () => {
    expect(isalpha('Z')).toEqual(true);
});

test('isalpha test 5', () => {
    expect(isalpha('0')).toEqual(false);
});
//#endregion
