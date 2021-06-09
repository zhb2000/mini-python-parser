import { throwErr } from "../utils/typing";

class Position {
    line: number = 0;
    start: number = 0;
    stop: number = 0;
}

interface IToken {
    position: Position;
}

class CommentToken implements IToken {
    content: string;
    position: Position;
    constructor(content: string, position: Position) {
        this.content = content;
        this.position = position;
    }
    toString() { return `CommentToken { ${this.content} }`; }
}

function makeCommentToken(s: string, pos: Position): CommentToken {
    console.assert(s[0] === '#');
    return new CommentToken(s.substring(1), pos);
}

//TODO int token, float token
class IntToken implements IToken {
    value: bigint;
    position: Position;
    constructor(value: bigint, position: Position) {
        this.value = value;
        this.position = position;
    }
    toString() { return `IntToken { ${this.value} }`; }
}
class FloatToken implements IToken {
    value: number;
    position: Position;
    constructor(value: number, position: Position) {
        this.value = value;
        this.position = position;
    }
    toString() { return `FloatToken { ${this.value} }`; }
}

class StringToken implements IToken {
    value: string;//TODO
    position: Position;
    constructor(value: string, position: Position) {
        this.value = value;
        this.position = position;
    }
    toString() { return `StringToken { ${this.value} }`; }
}

function makeStringToken(s: string, pos: Position): StringToken {
    const len = s.length;
    console.assert((s[0] === "'" && s[len - 1] === "'")
        || (s[0] === '"' && s[len - 1] === '"'));
    const value = s.substr(1, len - 2)
        .replace('\\n', '\n')
        .replace('\\r', '\r')
        .replace('\\t', '\t')
        .replace('\\\\', '\\');
    return new StringToken(value, pos);
}

class IdentifierToken implements IToken {
    name: string;
    //TODO 符号表指针
    position: Position;
    constructor(name: string, position: Position) {
        this.name = name;
        this.position = position;
    }
    toString() { return `IdentifierToken { ${this.name} }`; }
}

//#region Keyword Token
abstract class KeywordToken implements IToken {
    position: Position;
    constructor(position: Position) {
        this.position = position;
    }
    abstract toString(): string;
}

class DefToken extends KeywordToken { toString() { return 'KeywordToken def'; } }
class IfToken extends KeywordToken { toString() { return 'KeywordToken if'; } }
class ElseToken extends KeywordToken { toString() { return 'KeywordToken else'; } }
class ElifToken extends KeywordToken { toString() { return 'KeywordToken elif'; } }
class WhileToken extends KeywordToken { toString() { return 'KeywordToken while'; } }
class ReturnToken extends KeywordToken { toString() { return 'KeywordToken return'; } }
class BreakToken extends KeywordToken { toString() { return 'KeywordToken break'; } }
class ContinueToken extends KeywordToken { toString() { return 'KeywordToken continue'; } }
class AndToken extends KeywordToken { toString() { return 'KeywordToken and'; } }
class OrToken extends KeywordToken { toString() { return 'KeywordToken or'; } }
class NotToken extends KeywordToken { toString() { return 'KeywordToken not'; } }
class IsToken extends KeywordToken { toString() { return 'KeywordToken is'; } }
class TrueToken extends KeywordToken { toString() { return 'KeywordToken True'; } }
class FalseToken extends KeywordToken { toString() { return 'KeywordToken False'; } }
class NoneToken extends KeywordToken { toString() { return 'KeywordToken None'; } }
class PassToken extends KeywordToken { toString() { return 'KeywordToken pass'; } }
class GlobalToken extends KeywordToken { toString() { return 'KeywordToken global'; } }

function makeKeywordToken(s: string, pos: Position): KeywordToken {
    const ctor = keywordStr2Ctor.get(s)
        ?? throwErr(Error, `${s} is not a Python keyword.`);
    return new ctor(pos);
}

function isPythonKeyword(s: string): boolean {
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

//#region Symbol Token
abstract class SymbolToken implements IToken {
    position: Position;
    constructor(position: Position) {
        this.position = position;
    }
    abstract toString(): string;
}

class LessToken extends SymbolToken { toString() { return 'SymbolToken <'; } }
class LeqToken extends SymbolToken { toString() { return 'SymbolToken <='; } }
class GreaterToken extends SymbolToken { toString() { return 'SymbolToken >'; } }
class GeqToken extends SymbolToken { toString() { return 'SymbolToken >='; } }
class EqualsToken extends SymbolToken { toString() { return 'SymbolToken =='; } }
class NotEqualsToken extends SymbolToken { toString() { return 'SymbolToken !='; } }
class AssignToken extends SymbolToken { toString() { return 'SymbolToken ='; } }
class PlusToken extends SymbolToken { toString() { return 'SymbolToken +'; } }
class MinusToken extends SymbolToken { toString() { return 'SymbolToken -'; } }
class MultiplyToken extends SymbolToken { toString() { return 'SymbolToken *'; } }
class PowToken extends SymbolToken { toString() { return 'SymbolToken **'; } }
class DivToken extends SymbolToken { toString() { return 'SymbolToken /'; } }
class DivIntToken extends SymbolToken { toString() { return 'SymbolToken //'; } }
class ModToken extends SymbolToken { toString() { return 'SymbolToken %'; } }
class ShiftLeftToken extends SymbolToken { toString() { return 'SymbolToken <<'; } }
class ShiftRightToken extends SymbolToken { toString() { return 'SymbolToken >>'; } }
class BitAndToken extends SymbolToken { toString() { return 'SymbolToken &'; } }
class BitOrToken extends SymbolToken { toString() { return 'SymbolToken |'; } }
class BitNotToken extends SymbolToken { toString() { return 'SymbolToken ~'; } }
class BitXorToken extends SymbolToken { toString() { return 'SymbolToken ^'; } }
/** 左圆括号 `(` */
class LeftParenthesesToken extends SymbolToken { toString() { return 'SymbolToken ('; } }
/** 右圆括号 `)` */
class RightParenthesesToken extends SymbolToken { toString() { return 'SymbolToken )'; } }
/** 左方括号 `[` */
class LeftBracketToken extends SymbolToken { toString() { return 'SymbolToken ['; } }
/** 右方括号 `]` */
class RightBracketToken extends SymbolToken { toString() { return 'SymbolToken ]'; } }
/** 左花括号 `{` */
class LeftBraceToken extends SymbolToken { toString() { return 'SymbolToken {'; } }
/** 右花括号 `}` */
class RightBraceToken extends SymbolToken { toString() { return 'SymbolToken }'; } }
class CommaToken extends SymbolToken { toString() { return 'SymbolToken ,'; } }
class DotToken extends SymbolToken { toString() { return 'SymbolToken .'; } }
class ColonToken extends SymbolToken { toString() { return 'SymbolToken :'; } }

function makeSymbolToken(s: string, pos: Position): SymbolToken {
    const ctor = symStr2Ctor.get(s)
        ?? throwErr(Error, `${s} is not a Python symbol.`);
    return new ctor(pos);
}

const symStr2Ctor = new Map([
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

//#region Special Symbol
class IndentIncToken extends SymbolToken { toString() { return 'IndentInc'; } }
class IndentDecToken extends SymbolToken { toString() { return 'IndentDec'; } }
class NewLineToken extends SymbolToken { toString() { return 'NewLine'; } }
//#endregion

export {
    Position,
    IToken,
    CommentToken,
    makeCommentToken,
    makeStringToken,
    IdentifierToken,
    IntToken,
    FloatToken,
    makeKeywordToken,
    isPythonKeyword,
    makeSymbolToken,
    IndentIncToken,
    IndentDecToken,
    NewLineToken
};
