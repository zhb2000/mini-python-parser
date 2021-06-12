import { itertools, map, range } from '../utils/pylike';
import { throwErr } from '../utils/typing';
import { PySyntaxError } from './errors';
import { PyChar, SourceCode } from './preprocessor';
import { Automaton } from './dfa';
import {
    Position,
    IToken,
    CommentToken,
    IntToken,
    FloatToken,
    IdentifierToken,
    StringToken,
    IndentIncToken,
    IndentDecToken,
    NewLineToken,
    isPyKeyword,
    makeKeywordToken,
    makePunctuatorToken,
} from './token';

class Scanner {
    private readonly dfa = new Automaton();
    private readonly charBuffer: PyChar[] = [];
    private readonly posBuffer: Position[] = [];
    /** 状态名称 -> 制造对应类型 Token 的工厂函数 */
    private readonly tokenFactories =
        new Map<string, (s: string, pos: Position) => IToken>();

    constructor() {
        this.initTokenFactories();
    }

    scan(text: string): IToken[] {
        const tokens: IToken[] = [];
        const sourceCode = new SourceCode(text);
        const posAndChar = [...sourceCode.iterCharsWithPos()];
        let i = 0;
        while (i < posAndChar.length) {
            const [pos, ch] = posAndChar[i];
            if (this.canConsume(ch)) {
                this.consume(ch, pos);
                i++;
            } else {
                if (this.dfa.current().acceptable) {
                    const token = this.retrieveToken();
                    //忽略尾追的注释
                    if (!(token instanceof CommentToken)) {
                        tokens.push(token);
                    }
                } else {
                    const wrongToken = this.charBuffer.join('') + ch;
                    const start = this.posBuffer.length > 0 ? this.posBuffer[0].start : 0;
                    throw new PySyntaxError(
                        `Unexpected token ${wrongToken}, ` +
                        `line ${pos.line}, col ${start} - ${pos.stop}`
                    );
                }
            }
        }
        //最后一个字符
        if (this.dfa.current().acceptable) {
            const token = this.retrieveToken();
            if (!(token instanceof CommentToken)) {
                tokens.push(token);
            }
        } else {
            const wrongToken = this.charBuffer.join('');
            throw new PySyntaxError(`Unexpected token ${wrongToken}`);
        }
        return tokens;
    }

    /** 清除 buffer 并让 cursor 返回初始状态 */
    clear() {
        this.dfa.reset();
        this.charBuffer.length = 0;
        this.posBuffer.length = 0;
    }

    private canConsume(ch: PyChar): boolean {
        return this.dfa.canConsume(ch);
    }

    private consume(ch: PyChar, pos: Position) {
        this.dfa.consume(ch);
        //若转移后仍在开始状态，表明读入的是空白字符
        //忽略空白字符，不要放到 buffer 中
        if (this.dfa.current().name !== '1') {
            this.charBuffer.push(ch);
            this.posBuffer.push(pos);
        }
    }

    /** 获取 Token，不修改 buffer 和 DFA */
    private getToken(): IToken {
        const factory = this.tokenFactories.get(this.dfa.current().name)
            ?? throwErr(Error, `Node ${this.dfa.current().name} without a token factory`);
        const tokenStr = this.charBuffer.join('');
        const tokenPos: Position = {
            line: this.posBuffer[0].line,
            start: this.posBuffer[0].start,
            stop: this.posBuffer[this.posBuffer.length - 1].stop
        };
        return factory(tokenStr, tokenPos);
    }

    /** 获取 Token 并清空 buffer、DFA 回初态 */
    private retrieveToken(): IToken {
        const token = this.getToken();
        this.clear();
        return token;
    }

    private initTokenFactories() {
        //Comment Token: c2
        this.tokenFactories.set('c2', (s, pos) => new CommentToken(s, pos));
        //identifier or keyword: id2
        this.tokenFactories.set('id2',
            (s, pos) => isPyKeyword(s) ? makeKeywordToken(s, pos) : new IdentifierToken(s, pos)
        );
        //int: n2
        this.tokenFactories.set('n2', (s, pos) => new IntToken(s, pos));
        //float: n4
        this.tokenFactories.set('n4', (s, pos) => new FloatToken(s, pos));
        //str: s4
        this.tokenFactories.set('s4', (s, pos) => new StringToken(s, pos));
        //Punctuator Token: o2-o20, o5-o13
        for (const name of itertools.chain(
            map(i => 'o' + i, range(2, 20 + 1)), map(i => 'd' + i, range(5, 13 + 1)))) {
            this.tokenFactories.set(name, makePunctuatorToken);
        }
        //Special Punctuator Token: d2, d3, d4
        this.tokenFactories.set('d2', (_, pos) => new IndentIncToken(pos));
        this.tokenFactories.set('d3', (_, pos) => new IndentDecToken(pos));
        this.tokenFactories.set('d4', (_, pos) => new NewLineToken(pos));
    }
}

export { Position, Scanner };
