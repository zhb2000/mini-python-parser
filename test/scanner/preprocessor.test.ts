import { printCharSequences } from '../../src/debugio/printer';
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
