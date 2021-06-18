import { Scanner } from '../scanner/scanner.js';
import { IToken } from '../scanner/token.js';
import { ITokenSeq } from './ebnf.js';
import * as ebnf from './ebnf.js';
import * as ast from './ast.js';

class TokenSeq implements ITokenSeq {
    tokens: IToken[];
    nxt: number = 0;
    constructor(tokens: IToken[]) { this.tokens = tokens; }
    hasNext(): boolean { return this.nxt < this.tokens.length; }
    viewNext(): IToken { return this.tokens[this.nxt]; }
    goNext(): IToken {
        const token = this.tokens[this.nxt];
        this.nxt++;
        return token;
    }
}

class Parser {
    private readonly scanner = new Scanner();
    tokensToParseTree(tokens: IToken[]): ebnf.Program {
        const seq = new TokenSeq(tokens);
        return ebnf.Program.make(seq);
    }
    toParseTree(text: string): ebnf.Program {
        this.scanner.clear();
        const tokens = this.scanner.scan(text);
        return this.tokensToParseTree(tokens);
    }
    toAST(text: string): ast.ProgramNode {
        return this.toParseTree(text).toASTNode();
    }
}

export { Parser };
