import { throwErr } from "../utils/typing";
import { IndentDec, IndentInc, NewLine, PyChar } from "./preprocessor";

class Position {
    /** 行号 */
    line: number;
    /** 开始列号 */
    start: number;
    /** 结束列号 */
    stop: number;
    constructor(line: number, start: number, stop: number) {
        this.line = line;
        this.start = start;
        this.stop = stop;
    }
}

interface IToken {
    readonly type: string;
    readonly value: string;
    readonly position: Position;
    repr(): { type: string, value: string; };
}

abstract class TokenBase implements IToken {
    readonly value: string;
    readonly position: Position;
    get type() { return this.constructor.name; }
    constructor(value: string, position: Position) {
        console.assert(this.verify(value));
        this.value = value;
        this.position = position;
    }
    toString() { return `{ type: ${this.type}, value: ${this.value} }`; }
    repr() { return { 'type': this.type, 'value': this.value }; }
    protected verify(value: string): boolean { return true; };
}

class CommentToken extends TokenBase {
    protected verify(s: string) { return s[0] === '#'; }
    getComment(): string {
        return this.value.substr(1);
    }
}

class IntToken extends TokenBase {
    getInt(): bigint { return BigInt(this.value); }
}

class FloatToken extends TokenBase {
    getFloat(): number { return Number.parseFloat(this.value); }
}

class StringToken extends TokenBase {
    protected verify(s: string) {
        return (s[0] === "'" && s[s.length - 1] === "'")
            || (s[0] === '"' && s[s.length - 1] === '"');
    }
    getString(): string {
        return this.value.substr(1, this.value.length - 2)
            .replace(String.raw`\n`, '\n')
            .replace(String.raw`\r`, '\r')
            .replace(String.raw`\t`, '\t')
            .replace(String.raw`\'`, "'")
            .replace(String.raw`\"`, '"')
            .replace(String.raw`\\`, '\\');
    }
}

class IdentifierToken extends TokenBase { }

//#region Keyword Token
abstract class KeywordToken extends TokenBase {
    protected abstract keyword: string;
    protected verify(s: string) { return s === this.keyword; }
}

class DefToken extends KeywordToken { get keyword() { return 'def'; } }
class IfToken extends KeywordToken { get keyword() { return 'if'; } }
class ElseToken extends KeywordToken { get keyword() { return 'else'; } }
class ElifToken extends KeywordToken { get keyword() { return 'elif'; } }
class WhileToken extends KeywordToken { get keyword() { return 'while'; } }
class ReturnToken extends KeywordToken { get keyword() { return 'return'; } }
class BreakToken extends KeywordToken { get keyword() { return 'break'; } }
class ContinueToken extends KeywordToken { get keyword() { return 'continue'; } }
class AndToken extends KeywordToken { get keyword() { return 'and'; } }
class OrToken extends KeywordToken { get keyword() { return 'or'; } }
class NotToken extends KeywordToken { get keyword() { return 'not'; } }
class IsToken extends KeywordToken { get keyword() { return 'is'; } }
class TrueToken extends KeywordToken { get keyword() { return 'True'; } }
class FalseToken extends KeywordToken { get keyword() { return 'False'; } }
class NoneToken extends KeywordToken { get keyword() { return 'None'; } }
class PassToken extends KeywordToken { get keyword() { return 'pass'; } }
class GlobalToken extends KeywordToken { get keyword() { return 'global'; } }

function makeKeywordToken(s: string, pos: Position): KeywordToken {
    const ctor = keywordStr2Ctor.get(s)
        ?? throwErr(Error, `${s} is not a Python keyword.`);
    return new ctor(s, pos);
}

function isPyKeyword(s: string): boolean {
    return keywordStr2Ctor.has(s);
}

const keywordStr2Ctor = new Map([
    ['def', DefToken],
    ['if', IfToken],
    ['else', ElseToken],
    ['elif', ElifToken],
    ['while', WhileToken],
    ['return', ReturnToken],
    ['break', BreakToken],
    ['continue', ContinueToken],
    ['and', AndToken],
    ['or', OrToken],
    ['not', NotToken],
    ['is', IsToken],
    ['True', TrueToken],
    ['False', FalseToken],
    ['None', NoneToken],
    ['pass', PassToken],
    ['global', GlobalToken]
]);

//#endregion

//#region Punctuator Token
abstract class PunctuatorToken extends TokenBase {
    protected abstract punctuator: string;
    protected verify(s: string) { return s === this.punctuator; }
}

class LessToken extends PunctuatorToken { get punctuator() { return '<'; } }
class LeqToken extends PunctuatorToken { get punctuator() { return '<='; } }
class GreaterToken extends PunctuatorToken { get punctuator() { return '>'; } }
class GeqToken extends PunctuatorToken { get punctuator() { return '>='; } }
class EqualsToken extends PunctuatorToken { get punctuator() { return '=='; } }
class NotEqualsToken extends PunctuatorToken { get punctuator() { return '!='; } }
class AssignToken extends PunctuatorToken { get punctuator() { return '='; } }
class PlusToken extends PunctuatorToken { get punctuator() { return '+'; } }
class MinusToken extends PunctuatorToken { get punctuator() { return '-'; } }
class MultiplyToken extends PunctuatorToken { get punctuator() { return '*'; } }
class PowToken extends PunctuatorToken { get punctuator() { return '**'; } }
class DivToken extends PunctuatorToken { get punctuator() { return '/'; } }
class DivIntToken extends PunctuatorToken { get punctuator() { return '//'; } }
class ModToken extends PunctuatorToken { get punctuator() { return '%'; } }
class ShiftLeftToken extends PunctuatorToken { get punctuator() { return '<<'; } }
class ShiftRightToken extends PunctuatorToken { get punctuator() { return '>>'; } }
class BitAndToken extends PunctuatorToken { get punctuator() { return '&'; } }
class BitOrToken extends PunctuatorToken { get punctuator() { return '|'; } }
class BitNotToken extends PunctuatorToken { get punctuator() { return '~'; } }
class BitXorToken extends PunctuatorToken { get punctuator() { return '^'; } }
/** 左圆括号 `(` */
class LeftParenthesesToken extends PunctuatorToken { get punctuator() { return '('; } }
/** 右圆括号 `)` */
class RightParenthesesToken extends PunctuatorToken { get punctuator() { return ')'; } }
/** 左方括号 `[` */
class LeftBracketToken extends PunctuatorToken { get punctuator() { return '['; } }
/** 右方括号 `]` */
class RightBracketToken extends PunctuatorToken { get punctuator() { return ']'; } }
/** 左花括号 `{` */
class LeftBraceToken extends PunctuatorToken { get punctuator() { return '{'; } }
/** 右花括号 `}` */
class RightBraceToken extends PunctuatorToken { get punctuator() { return '}'; } }
class CommaToken extends PunctuatorToken { get punctuator() { return ','; } }
class DotToken extends PunctuatorToken { get punctuator() { return '.'; } }
class ColonToken extends PunctuatorToken { get punctuator() { return ':'; } }

function makePunctuatorToken(s: string, pos: Position): PunctuatorToken {
    const ctor = punctuatorStr2Ctor.get(s)
        ?? throwErr(Error, `${s} is not a Python symbol.`);
    return new ctor(s, pos);
}

const punctuatorStr2Ctor = new Map([
    ['<', LessToken],
    ['<=', LeqToken],
    ['>', GreaterToken],
    ['>=', GeqToken],
    ['==', EqualsToken],
    ['!=', NotEqualsToken],
    ['=', AssignToken],
    ['+', PlusToken],
    ['-', MinusToken],
    ['*', MultiplyToken],
    ['**', PowToken],
    ['/', DivToken],
    ['//', DivIntToken],
    ['%', ModToken],
    ['<<', ShiftLeftToken],
    ['>>', ShiftRightToken],
    ['&', BitAndToken],
    ['|', BitOrToken],
    ['~', BitNotToken],
    ['^', BitXorToken],
    ['(', LeftParenthesesToken],
    [')', RightParenthesesToken],
    ['[', LeftBracketToken],
    [']', RightBracketToken],
    ['{', LeftBraceToken],
    ['}', RightBraceToken],
    [',', CommaToken],
    ['.', DotToken],
    [':', ColonToken]
]);
//#endregion

//#region Special Punctuator Token
abstract class SpecialPunctuatorToken implements IToken {
    readonly position: Position;
    get value() { return ''; }
    get type() { return this.constructor.name; }
    constructor(position: Position) { this.position = position; }
    toString() { return `{ type: ${this.type}, value: ${this.value} }`; }
    repr() { return { 'type': this.type, 'value': this.value }; }
}
class IndentIncToken extends SpecialPunctuatorToken { }
class IndentDecToken extends SpecialPunctuatorToken { }
class NewLineToken extends SpecialPunctuatorToken { }
//#endregion

export {
    Position,
    IToken,
    CommentToken,
    IdentifierToken,
    IntToken,
    FloatToken,
    StringToken,
    MultiplyToken,
    DivIntToken,
    DivToken,
    ModToken,
    PlusToken,
    MinusToken,
    ShiftLeftToken,
    ShiftRightToken,
    BitAndToken,
    BitOrToken,
    BitNotToken,
    BitXorToken,
    LessToken,
    LeqToken,
    GreaterToken,
    GeqToken,
    EqualsToken,
    NotEqualsToken,
    IsToken,
    AndToken,
    OrToken,
    NotToken,
    LeftParenthesesToken,
    RightParenthesesToken,
    DotToken,
    LeftBracketToken,
    RightBracketToken,
    CommaToken,
    PowToken,
    PassToken,
    BreakToken,
    ContinueToken,
    GlobalToken,
    ReturnToken,
    AssignToken,
    WhileToken,
    IfToken,
    ElifToken,
    ElseToken,
    DefToken,
    ColonToken,
    TrueToken,
    FalseToken,
    NoneToken,
    IndentIncToken,
    IndentDecToken,
    NewLineToken,
    isPyKeyword,
    makeKeywordToken,
    makePunctuatorToken,
};
