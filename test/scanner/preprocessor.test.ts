import { printCharSequences } from '../../src/debugio/printer';
import { makeCharSequences } from '../../src/scanner/preprocessor';

test('makeCharSequences test 1', () => {
    const text = `
if True:
    aaaa
    bbbb
    if True
        cccc
        dddd
    while True
        aaaa
`;
    const expected =
        'if True: NewLine ' +
        'IndentInc aaaa NewLine ' +
        'bbbb NewLine ' +
        'if True NewLine ' +
        'IndentInc cccc NewLine ' +
        'dddd NewLine ' +
        'IndentDec while True NewLine ' +
        'IndentInc aaaa NewLine ' +
        'IndentDec IndentDec';
    const sequences = makeCharSequences(text)
    expect(printCharSequences(sequences)).toEqual(expected);
});

test('test 1', () => {
    const a = [{ a: 0, b: 5 }, { a: 1, b: 6 }];
    const b = [{ a: 0, b: 5 }, { a: 1, b: 6 }];
    expect(a).toEqual(b);
});

test('test 2', () => {
    const a = new Map([['a', 5], ['b', 6]]);
    const b = new Map([['b', 6], ['a', 5]]);
    expect(a).toEqual(b);
});
