import { PySyntaxError } from '../../src/scanner/errors';
import { Scanner } from '../../src/scanner/scanner';
import { cases } from './scannerTestCases';

test('Scanner.scan test 0', () => {
    const ci = 0;
    const scanner = new Scanner();
    const tokens = scanner.scan(cases[ci].input);
    expect(tokens.map(token => token.repr())).toEqual(cases[ci].expected);
});

test('Scanner.scan test 1', () => {
    const ci = 1;
    const scanner = new Scanner();
    const tokens = scanner.scan(cases[ci].input);
    expect(tokens.map(token => token.repr())).toEqual(cases[ci].expected);
});

test('Scanner.scan test 2', () => {
    const ci = 2;
    const scanner = new Scanner();
    const tokens = scanner.scan(cases[ci].input);
    expect(tokens.map(token => token.repr())).toEqual(cases[ci].expected);
});

test('Scanner.scan test 3', () => {
    const ci = 3;
    const scanner = new Scanner();
    const tokens = scanner.scan(cases[ci].input);
    expect(tokens.map(token => token.repr())).toEqual(cases[ci].expected);
});

test('Scanner.scan Error test 0', () => {
    const scanner = new Scanner();
    const text = 'a = 123$'; // 非法符号
    expect(() => scanner.scan(text)).toThrow(PySyntaxError);
});

test('Scanner.scan Error test 1', () => {
    const scanner = new Scanner();
    const text = "'abcd\nabcd'"; // 字符串中出现换行
    expect(() => scanner.scan(text)).toThrow(PySyntaxError);
});

test('Scanner.scan Error test 2', () => {
    const scanner = new Scanner();
    const text = "'abc"; // 字符串右边缺引号
    expect(() => scanner.scan(text)).toThrow(PySyntaxError);
});

test('Scanner.scan Error test 3', () => {
    const scanner = new Scanner();
    const text = String.raw`'hello'hello'`; // 单引号字符串中的单引号未转义
    expect(() => scanner.scan(text)).toThrow(PySyntaxError);
});

test('Scanner.scan Error test 4', () => {
    const scanner = new Scanner();
    const text = String.raw`'abc"`; // 字符串一边单引号一边双引号
    expect(() => scanner.scan(text)).toThrow(PySyntaxError);
});
