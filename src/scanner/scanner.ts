import { itertools, map, range } from '../utils/pylike';
import { isdigit, isalpha } from '../utils/strutils';
import { asNonNull, Optional, throwErr } from '../utils/typing';
import { PySyntaxError } from './errors';
import {
    IndentInc,
    IndentDec,
    NewLine,
    PyChar,
    SourceCode
} from './preprocessor';
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

class PyCharMap<V> {
    private strMap: Map<string, V> = new Map();
    private indentIncValue: Optional<V> = undefined;
    private indentDecValue: Optional<V> = undefined;
    private newlineValue: Optional<V> = undefined;
    private digitValue: Optional<V> = undefined;
    private letterValue: Optional<V> = undefined;

    setIndentIncValue(value: V): this {
        this.indentIncValue = value;
        return this;
    }
    setIndentDecValue(value: V): this {
        this.indentDecValue = value;
        return this;
    }
    setNewLineValue(value: V): this {
        this.newlineValue = value;
        return this;
    }
    setDigitValue(value: V): this {
        this.digitValue = value;
        return this;
    }
    setLetterValue(value: V): this {
        this.letterValue = value;
        return this;
    }
    setStrMap(map: Map<string, V>): this {
        this.strMap = map;
        return this;
    }
    set(key: PyChar, value: V): this {
        if (key instanceof IndentInc) {
            this.indentIncValue = value;
        } else if (key instanceof IndentDec) {
            this.indentDecValue = value;
        } else if (key instanceof NewLine) {
            this.newlineValue = value;
        } else {
            this.strMap.set(key, value);
        }
        return this;
    }
    get(key: PyChar): Optional<V> {
        if (key instanceof IndentInc) {
            return this.indentIncValue;
        } else if (key instanceof IndentDec) {
            return this.indentDecValue;
        } else if (key instanceof NewLine) {
            return this.newlineValue;
        } else if (isdigit(key)) {
            return this.strMap.get(key) ?? this.digitValue;
        } else if (isalpha(key)) {
            return this.strMap.get(key) ?? this.letterValue;
        } else {
            return this.strMap.get(key);
        }
    }
}

interface INode {
    name: string;
    acceptable: boolean;
    to(ch: PyChar): Optional<INode>;
}

class Automaton {
    private nodes = new Map<string, INode>();
    private cursor: INode;

    canConsume(ch: PyChar): boolean {
        return this.cursor.to(ch) != null;
    }

    consume(ch: PyChar) {
        this.cursor = asNonNull(this.cursor.to(ch));
    }

    /** 当前状态 */
    current(): INode {
        return this.cursor;
    }

    /** 让 cursor 返回初始状态 */
    reset() {
        this.cursor = asNonNull(this.nodes.get('1'));
    }

    constructor() {
        this.initNodes();
        this.cursor = asNonNull(this.nodes.get('1'));
    }

    private initNodes() {
        const that = this;
        //1
        this.addNode('1', false,
            new PyCharMap<string>()
                .setLetterValue('id2')
                .setDigitValue('n2')
                .setIndentIncValue('d2')
                .setIndentDecValue('d3')
                .setNewLineValue('d4')
                .setStrMap(new Map([
                    ['#', 'c2'], ['_', 'id2'], ['"', 's5'],
                    ["'", 's2'], ['+', 'o2'], ['-', 'o3'],
                    ['*', 'o4'], ['/', 'o5'], ['%', 'o20'],
                    ['<', 'o8'], ['>', 'o9'], ['=', 'o10'],
                    ['&', 'o16'], ['|', 'o17'], ['~', 'o18'],
                    ['^', 'o19'], ['(', 'd5'], [')', 'd6'],
                    ['[', 'd7'], [']', 'd8'], ['{', 'd9'],
                    [']', 'd10'], [',', 'd11'], ['.', 'd12'],
                    [':', 'd13'], [' ', '1'], ['\t', '1']
                ]))
        );
        //c2
        this.nodes.set('c2', {
            name: 'c2', acceptable: false,
            to(ch: PyChar) {
                const key = (ch instanceof NewLine) ? 'c3' : 'c2';
                return that.nodes.get(key);
            }
        });
        //c3
        this.addNode('c3', true, new PyCharMap());
        //id2
        this.addNode('id2', true,
            new PyCharMap<string>()
                .setLetterValue('id2')
                .setDigitValue('id2')
                .set('_', 'id2')
        );
        //n2
        this.addNode('n2', true,
            new PyCharMap<string>()
                .setDigitValue('n2').set('.', 'n3')
        );
        //n3
        this.addNode('n3', false, new PyCharMap<string>().setDigitValue('n4'));
        //n4
        this.addNode('n4', true, new PyCharMap<string>().setDigitValue('n4'));
        //s5
        this.nodes.set('s5', {
            name: 's5', acceptable: false,
            to(ch: PyChar) {
                let key = undefined;
                if (ch === '"') {
                    key = 's4';
                } else if (ch === '\\') {
                    key = 's6';
                } else if (!(ch instanceof NewLine)) {
                    key = 's5';
                }
                return (key != null) ? that.nodes.get(key) : undefined;
            }
        });
        //s6
        this.nodes.set('s6', {
            name: 's6', acceptable: false,
            to(ch: PyChar) {
                return (!(ch instanceof NewLine))
                    ? that.nodes.get('s5') : undefined;
            }
        });
        //s4
        this.addNode('s4', true, new PyCharMap());
        //s2
        this.nodes.set('s2', {
            name: 's2', acceptable: false,
            to(ch: PyChar) {
                let key = undefined;
                if (ch === "'") {
                    key = 's4';
                } else if (ch === '\\') {
                    key = 's3';
                } else if (!(ch instanceof NewLine)) {
                    key = 's2';
                }
                return (key != null) ? that.nodes.get(key) : undefined;
            }
        });
        //s3
        this.nodes.set('s3', {
            name: 's3', acceptable: false,
            to(ch: PyChar) {
                return (!(ch instanceof NewLine))
                    ? that.nodes.get('s2') : undefined;
            }
        });
        //o2
        this.addNode('o2', true, new PyCharMap());
        //o3
        this.addNode('o3', true, new PyCharMap());
        //o4
        this.addNode('o4', true, new PyCharMap<string>().set('*', 'o6'));
        //o5
        this.addNode('o5', true, new PyCharMap<string>().set('/', 'o7'));
        //o6
        this.addNode('o6', true, new PyCharMap());
        //o7
        this.addNode('o7', true, new PyCharMap());
        //o20
        this.addNode('o20', true, new PyCharMap());
        //o8
        this.addNode('o8', true,
            new PyCharMap<string>()
                .set('<', 'o14').set('=', 'o11')
        );
        //o14
        this.addNode('o14', true, new PyCharMap());
        //o11
        this.addNode('o11', true, new PyCharMap());
        //o9
        this.addNode('o9', true,
            new PyCharMap<string>()
                .set('>', 'o15').set('=', 'o12')
        );
        //o10
        this.addNode('o10', true, new PyCharMap<string>().set('=', 'o13'));
        //o11-o19, d2-d13
        for (const name of itertools.chain(
            map(i => 'o' + i, range(11, 19 + 1)),
            map(i => 'd' + i, range(2, 13 + 1)))) {
            this.addNode(name, true, new PyCharMap());
        }
    }

    private addNode(name: string, acceptable: boolean,
        char2NodeName: PyCharMap<string>) {
        const that = this;
        const node = {
            name, acceptable, char2NodeName,
            to(ch: PyChar) {
                const key = this.char2NodeName.get(ch);
                return (key != null) ? that.nodes.get(key) : undefined;
            }
        };
        this.nodes.set(name, node);
    }
}

class Scanner {
    private dfa: Automaton = new Automaton();
    private charBuffer: PyChar[] = [];
    private posBuffer: Position[] = [];
    private tokenFactories = new Map<string, (s: string, pos: Position) => IToken>();

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

    private canConsume(ch: PyChar): boolean {
        return this.dfa.canConsume(ch);
    }

    private consume(ch: PyChar, pos: Position) {
        this.dfa.consume(ch);
        if (this.dfa.current().name !== '1') {
            this.charBuffer.push(ch);
            this.posBuffer.push(pos);
        }
    }

    /** 清除 buffer 并让 cursor 返回初始状态 */
    private clear() {
        this.dfa.reset();
        this.charBuffer.length = 0;
        this.posBuffer.length = 0;
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
        //Comment Token: c3
        this.tokenFactories.set('c3', (s, pos) => new CommentToken(s, pos));
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
