import { makeCharSequences } from './scanner/preprocessor';
import { printCharSequences } from './debugio/printer';
import { Scanner } from './scanner/scanner';

console.log('I am in main');

let text = String.raw`'abc"`;

// console.log(printCharSequences(makeCharSequences(text)));
const scanner = new Scanner();
const tokens = scanner.scan(text);
// tokens.forEach(token => console.log(token.toString()));
console.log(tokens.map(token => token.repr()));
