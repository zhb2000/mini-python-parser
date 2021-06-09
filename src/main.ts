import { makeCharSequences } from './scanner/preprocessor';
import { printCharSequences } from './debugio/printer';
import { Scanner } from './scanner/scanner';

console.log('I am in main');
// let text = `
// if True:
//     aaa
//     bbb
//     if True:
//         ccc
//         ddd
//     while True:
//         aaa`;

// text = `
// def fn():
//     aaa
//     if True:
//         aaa


// a = fn()
// if a > 0:
//     if b > 0:
//         aaa
//         bbb
//     aaa
// bbb`;

let text = `
def fn():
    a=123
    if True:
        a = 'abcd'


a = fn()
if a > 0:
    if b > 0:
        a = fn("abcde")  # comment
        # comment
            # comment
        b = b << a
    a = a | b
bbb`;

text = '<< a'

// console.log(printCharSequences(makeCharSequences(text)));
const scanner = new Scanner();
const tokens = scanner.scan(text);
tokens.forEach(token => console.log(token.toString()));
console.log(tokens);
