import { printCharSequences } from '../../src/debugio/printer';
import { makeCharSequences } from '../../src/scanner/preprocessor';

test('makeCharSequences test 1', () => {
    const text = `
if True:
    aaa
    bbb
    if True:
        ccc
        ddd
    while True:
        aaa
`;
    const expected =
        'if True: NewLine ' +
        'IndentInc ' +
        'aaa NewLine ' +
        'bbb NewLine ' +
        'if True: NewLine ' +
        'IndentInc ' +
        'ccc NewLine ' +
        'ddd NewLine ' +
        'IndentDec ' +
        'while True: NewLine ' +
        'IndentInc ' +
        'aaa NewLine ' +
        'IndentDec ' +
        'IndentDec';
    const sequences = makeCharSequences(text);
    expect(printCharSequences(sequences)).toEqual(expected);
});

test('makeCharSequences test 2', () => {
    const text = `
def fn():
    aaa
    if True:
        aaa


a = fn()
if a > 0:
    if b > 0:
        aaa
        bbb
    aaa
bbb
`;
    const expected =
        'def fn(): NewLine ' +
        'IndentInc ' +
        'aaa NewLine ' +
        'if True: NewLine ' +
        'IndentInc ' +
        'aaa NewLine ' +
        'IndentDec ' +
        'IndentDec ' +
        'a = fn() NewLine ' +
        'if a > 0: NewLine ' +
        'IndentInc ' +
        'if b > 0: NewLine ' +
        'IndentInc ' +
        'aaa NewLine ' +
        'bbb NewLine ' +
        'IndentDec ' +
        'aaa NewLine ' +
        'IndentDec ' +
        'bbb NewLine';
    const sequences = makeCharSequences(text);
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
