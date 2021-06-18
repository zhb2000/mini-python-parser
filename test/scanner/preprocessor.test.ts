import { printCharSequences } from '../../src/debugio/printer';
import { PySyntaxError } from '../../src/errors';
import { makeCharSequences } from '../../src/scanner/preprocessor';
import { cases } from './preprocessorTestCases';

test('makeCharSequences test 0', () => {
    const sequences = makeCharSequences(cases[0].input);
    expect(printCharSequences(sequences)).toEqual(cases[0].expected);
});

test('makeCharSequences test 1', () => {
    const sequences = makeCharSequences(cases[1].input);
    expect(printCharSequences(sequences)).toEqual(cases[1].expected);
});

test('makeCharSequences test 2', () => {
    const sequences = makeCharSequences(cases[2].input);
    expect(printCharSequences(sequences)).toEqual(cases[2].expected);
});

test('makeCharSequences error test 0', () => {
    const text =
        'if True:\n' +
        '    aaa\n' +
        '   bbb';
    expect(() => makeCharSequences(text)).toThrow(PySyntaxError);
});

test('makeCharSequences error test 1', () => {
    const text =
        'if True:\n' +
        '    aaa\n' +
        '     bbb';
    expect(() => makeCharSequences(text)).toThrow(PySyntaxError);
});

test('makeCharSequences error test 2', () => {
    const text =
        'if True:\n' +
        '    aaa\n' +
        '\t bbb';
    expect(() => makeCharSequences(text)).toThrow(PySyntaxError);
});