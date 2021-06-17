import { cases } from './parserTreeCases';
import { Parser } from '../../src/parser/parser';
import { PySyntaxError } from '../../src/errors';

test('Parser.toParseTree test 0', () => {
    const ci = 0;
    const parser = new Parser();
    parser.toParseTree(cases[ci].input);
});

test('Parser.toParseTree test 1', () => {
    const ci = 1;
    const parser = new Parser();
    parser.toParseTree(cases[ci].input);
});

test('Parser.toParseTree test 2', () => {
    const ci = 2;
    const parser = new Parser();
    parser.toParseTree(cases[ci].input);
});

test('Parser.toParseTree Error test 0', () => {
    const parser = new Parser();
    const text = 'a = ((2+3) * 8'; // 括号不匹配
    expect(() => parser.toParseTree(text)).toThrow(PySyntaxError);
});

test('Parser.toParseTree Error test 1', () => {
    const parser = new Parser();
    const text = ' a = 123abc';
    expect(() => parser.toParseTree(text)).toThrow(PySyntaxError);
});

test('Parser.toParseTree Error test 2', () => {
    const parser = new Parser();
    const text =
        'a = 15\n' +
        'if a > 0:\n' +
        '    a = 123\n' +
        '        a = 123\n'; // 缩进错误
    expect(() => parser.toParseTree(text)).toThrow(PySyntaxError);
});

test('Parser.toParseTree Error test 3', () => {
    const parser = new Parser();
    const text =
        'a = 15\n' +
        'if a > 0:\n' +
        '        a = 123\n' +
        '    a = 123\n'; // 缩进错误
    expect(() => parser.toParseTree(text)).toThrow(PySyntaxError);
});

test('Parser.toParseTree Error test 4', () => {
    const parser = new Parser();
    const text =
        'a = 15\n' +
        'if a > 0\n' +
        '    a = 123\n' +
        '    print(a)\n'; // if 忘加冒号
    expect(() => parser.toParseTree(text)).toThrow(PySyntaxError);
});
