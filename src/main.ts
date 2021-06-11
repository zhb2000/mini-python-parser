import { makeCharSequences } from './scanner/preprocessor';
import { printCharSequences } from './debugio/printer';
import { Scanner } from './scanner/scanner';
import { Program, ITokenSeq } from './parser/ebnf';
import { IToken } from './scanner/token';
import * as scannerTest from '../test/scanner/scannerTestCases';

class TokenSeq implements ITokenSeq {
    tokens: IToken[];
    nxt: number = 0;
    constructor(tokens: IToken[]) { this.tokens = tokens; }
    hasNext(): boolean {
        return this.nxt < this.tokens.length;
    }
    viewNext(): IToken {
        return this.tokens[this.nxt];
    }
    goNext(): IToken {
        const token = this.tokens[this.nxt];
        this.nxt++;
        console.log(token.repr());
        return token;
    }
}

console.log('I am in main');

let text = scannerTest.cases[0].input;

// console.log(printCharSequences(makeCharSequences(text)));
const scanner = new Scanner();
const tokens = scanner.scan(text);
const tokenSeq = new TokenSeq(tokens);
const program = Program.make(tokenSeq);
console.log(program);
