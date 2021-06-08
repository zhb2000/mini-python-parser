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
}

class NumberToken implements IToken {
    value: number;
    position: Position;
    constructor(value: number, position: Position) {
        this.value = value;
        this.position = position;
    }
}

class StringToken implements IToken {
    value: string;
    position: Position;
    constructor(value: string, position: Position) {
        this.value = value;
        this.position = position;
    }
}

class IdentifierToken implements IToken {
    name: string;
    //符号表指针
    position: Position;
    constructor(name: string, position: Position) {
        this.name = name;
        this.position = position;
    }
}

enum Keyword {
    Def = 'def',
    If = 'if',
    Else = 'else',
    Elif = 'elif',
    While = 'while',
    Return = 'return',
    Break = 'break',
    Continue = 'continue',
    And = 'and',
    Or = 'or',
    Not = 'not',
    Is = 'is',
    True = 'True',
    False = 'False',
    None = 'None',
    Pass = 'pass',
    Global = 'global',
}

class KeywordToken implements IToken {
    position: Position;
    keyword: Keyword;
    constructor(keyword: Keyword, position: Position) {
        this.position = position;
        this.keyword = keyword;
    }
}

enum Sym {
    Less = '<',
    Leq = '<=',
    Greater = '>',
    Geq = '>=',
    Equals = '==',
    NotEquals = '!=',
    Assign = '=',
    plus = '+',
    Minus = '-',
    Multiply = '*',
    Pow = '**',
    Div = '/',
    DivInt = '//',
    Mod = '%'
}

export { Position, IToken };
