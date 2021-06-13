import { assert, Constructor, throwErr } from "../utils/enhance";

interface IPosition {
    /** 行号 */
    line: number;
    /** 开始列号 */
    start: number;
    /** 结束列号 */
    stop: number;
}

interface IToken {
    readonly type: string;
    readonly value: string;
    readonly position: IPosition;
    repr(): { type: string, value: string; };
}

abstract class TokenBase implements IToken {
    readonly value: string;
    readonly position: IPosition;
    get type() { return this.constructor.name; }
    constructor(value: string, position: IPosition) {
        assert(this.verify(value));
        this.value = value;
        this.position = position;
    }
    toString() { return `{ type: ${this.type}, value: ${this.value} }`; }
    repr() { return { 'type': this.type, 'value': this.value }; }
    protected verify(value: string): boolean { return true; };
}

class CommentToken extends TokenBase {
    protected verify(s: string) { return s[0] === '#'; }
    getComment(): string { return this.value.substr(1); }
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

class IdentifierToken extends TokenBase { private _ = undefined; }

//#region Keyword Token
abstract class KeywordToken extends TokenBase {
    protected abstract keyword(): string;
    protected verify(s: string) { return s === this.keyword(); }
}

class DefToken extends KeywordToken { protected keyword() { return 'def'; } }
class IfToken extends KeywordToken { protected keyword() { return 'if'; } }
class ElseToken extends KeywordToken { protected keyword() { return 'else'; } }
class ElifToken extends KeywordToken { protected keyword() { return 'elif'; } }
class WhileToken extends KeywordToken { protected keyword() { return 'while'; } }
class ReturnToken extends KeywordToken { protected keyword() { return 'return'; } }
class BreakToken extends KeywordToken { protected keyword() { return 'break'; } }
class ContinueToken extends KeywordToken { protected keyword() { return 'continue'; } }
class AndToken extends KeywordToken { protected keyword() { return 'and'; } }
class OrToken extends KeywordToken { protected keyword() { return 'or'; } }
class NotToken extends KeywordToken { protected keyword() { return 'not'; } }
class IsToken extends KeywordToken { protected keyword() { return 'is'; } }
class TrueToken extends KeywordToken { protected keyword() { return 'True'; } }
class FalseToken extends KeywordToken { protected keyword() { return 'False'; } }
class NoneToken extends KeywordToken { protected keyword() { return 'None'; } }
class PassToken extends KeywordToken { protected keyword() { return 'pass'; } }
class GlobalToken extends KeywordToken { protected keyword() { return 'global'; } }

function makeKeywordToken(s: string, pos: IPosition): KeywordToken {
    const ctor = keywordStr2Ctor.get(s)
        ?? throwErr(Error, `${s} is not a Python keyword.`);
    return new ctor(s, pos);
}

function isPyKeyword(s: string): boolean {
    return keywordStr2Ctor.has(s);
}

const keywordStr2Ctor = new Map<string, Constructor<KeywordToken>>([
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
    protected abstract punctuator(): string;
    protected verify(s: string) { return s === this.punctuator(); }
}

class LessToken extends PunctuatorToken { protected punctuator() { return '<'; } }
class LeqToken extends PunctuatorToken { protected punctuator() { return '<='; } }
class GreaterToken extends PunctuatorToken { protected punctuator() { return '>'; } }
class GeqToken extends PunctuatorToken { protected punctuator() { return '>='; } }
class EqualsToken extends PunctuatorToken { protected punctuator() { return '=='; } }
class NotEqualsToken extends PunctuatorToken { protected punctuator() { return '!='; } }
class AssignToken extends PunctuatorToken { protected punctuator() { return '='; } }
class PlusToken extends PunctuatorToken { protected punctuator() { return '+'; } }
class MinusToken extends PunctuatorToken { protected punctuator() { return '-'; } }
class MultiplyToken extends PunctuatorToken { protected punctuator() { return '*'; } }
class PowToken extends PunctuatorToken { protected punctuator() { return '**'; } }
class DivToken extends PunctuatorToken { protected punctuator() { return '/'; } }
class DivIntToken extends PunctuatorToken { protected punctuator() { return '//'; } }
class ModToken extends PunctuatorToken { protected punctuator() { return '%'; } }
class ShiftLeftToken extends PunctuatorToken { protected punctuator() { return '<<'; } }
class ShiftRightToken extends PunctuatorToken { protected punctuator() { return '>>'; } }
class BitAndToken extends PunctuatorToken { protected punctuator() { return '&'; } }
class BitOrToken extends PunctuatorToken { protected punctuator() { return '|'; } }
class BitNotToken extends PunctuatorToken { protected punctuator() { return '~'; } }
class BitXorToken extends PunctuatorToken { protected punctuator() { return '^'; } }
/** 左圆括号 `(` */
class LeftParenthesesToken extends PunctuatorToken { protected punctuator() { return '('; } }
/** 右圆括号 `)` */
class RightParenthesesToken extends PunctuatorToken { protected punctuator() { return ')'; } }
/** 左方括号 `[` */
class LeftBracketToken extends PunctuatorToken { protected punctuator() { return '['; } }
/** 右方括号 `]` */
class RightBracketToken extends PunctuatorToken { protected punctuator() { return ']'; } }
/** 左花括号 `{` */
class LeftBraceToken extends PunctuatorToken { protected punctuator() { return '{'; } }
/** 右花括号 `}` */
class RightBraceToken extends PunctuatorToken { protected punctuator() { return '}'; } }
class CommaToken extends PunctuatorToken { protected punctuator() { return ','; } }
class DotToken extends PunctuatorToken { protected punctuator() { return '.'; } }
class ColonToken extends PunctuatorToken { protected punctuator() { return ':'; } }

function makePunctuatorToken(s: string, pos: IPosition): PunctuatorToken {
    const ctor = punctuatorStr2Ctor.get(s)
        ?? throwErr(Error, `${s} is not a Python symbol.`);
    return new ctor(s, pos);
}

const punctuatorStr2Ctor = new Map<string, Constructor<PunctuatorToken>>([
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
    readonly position: IPosition;
    get value() { return ''; }
    get type() { return this.constructor.name; }
    constructor(position: IPosition) { this.position = position; }
    toString() { return `{ type: ${this.type}, value: ${this.value} }`; }
    repr() { return { 'type': this.type, 'value': this.value }; }
}
class IndentIncToken extends SpecialPunctuatorToken { private _ = undefined; }
class IndentDecToken extends SpecialPunctuatorToken { private _ = undefined; }
class NewLineToken extends SpecialPunctuatorToken { private _ = undefined; }
//#endregion

export {
    IPosition,
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
