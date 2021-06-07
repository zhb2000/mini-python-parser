import { makeCharSequences } from './scanner/preprocessor';
import {printCharSequences} from './debugio/printer'

console.log('I am in main');
const text = `
if True:
    aaaa
    bbbb
    if True
        cccc
        dddd
    while True
        aaaa`;

console.log(printCharSequences(makeCharSequences(text)));
