import { cases } from './astCases';
import { Parser } from '../../src/parser/parser';
import { PySyntaxError } from '../../src/errors';

const parser = new Parser();

test('Parser.toAST test 0', () => {
    const ci = 0;
    parser.toParseTree(cases[ci].input);
    const ast = parser.toAST(cases[ci].input).repr();
    expect(ast).toEqual(cases[ci].expected);
});

test('Parser.toAST test 1', () => {
    const ci = 1;
    parser.toParseTree(cases[ci].input);
    const ast = parser.toAST(cases[ci].input).repr();
    expect(ast).toEqual(cases[ci].expected);
});

test('Parser.toAST test 2', () => {
    const ci = 2;
    parser.toParseTree(cases[ci].input);
    const ast = parser.toAST(cases[ci].input).repr();
    expect(ast).toEqual(cases[ci].expected);
});

test('Parser.toAST test 3', () => {
    const ci = 3;
    parser.toParseTree(cases[ci].input);
    const ast = parser.toAST(cases[ci].input).repr();
    expect(ast).toEqual(cases[ci].expected);
});

test('Parser.toAST test 4', () => {
    const ci = 3;
    parser.toParseTree(cases[ci].input);
    const ast = parser.toAST(cases[ci].input).repr();
    expect(ast).toEqual(cases[ci].expected);
});

test('Parser.toAST test 5', () => {
    const ci = 3;
    parser.toParseTree(cases[ci].input);
    const ast = parser.toAST(cases[ci].input).repr();
    expect(ast).toEqual(cases[ci].expected);
});

test('Parser.toAST Error test 0', () => {
    const text = 'a(2,3) = 123'; // 赋值语句左侧不是 target
    expect(() => parser.toAST(text)).toThrow(PySyntaxError);
});
