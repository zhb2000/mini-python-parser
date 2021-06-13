import { Constructor, Optional } from '../utils/enhance';
import { PySyntaxError } from '../scanner/errors';
import {
    IToken,
    BitAndToken,
    DivIntToken,
    DivToken,
    MinusToken,
    ModToken,
    MultiplyToken,
    PlusToken,
    ShiftLeftToken,
    ShiftRightToken,
    BitOrToken,
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
    IdentifierToken,
    StringToken,
    IntToken,
    FloatToken,
    LeftParenthesesToken,
    RightParenthesesToken,
    DotToken,
    LeftBracketToken,
    RightBracketToken,
    CommaToken,
    PowToken,
    BitNotToken,
    NotToken,
    NewLineToken,
    PassToken,
    BreakToken,
    ContinueToken,
    GlobalToken,
    ReturnToken,
    AssignToken,
    IndentIncToken,
    IndentDecToken,
    WhileToken,
    IfToken,
    ElifToken,
    ElseToken,
    DefToken,
    ColonToken,
    TrueToken,
    FalseToken,
    NoneToken,
} from '../scanner/token';

/** 文法符号 */
interface IGrammarSymbol {
    readonly type: string;
    repr(): { type: string; };
}

/** 定义了三种操作的 token 序列 */
interface ITokenSeq {
    /** 是否有下一个 token */
    hasNext(): boolean;
    /** 查看下一个 token */
    viewNext(): IToken;
    /** 取出消耗一个 token，指针后移 */
    goNext(): IToken;
}

/**
 * 查看 token 序列中的下一个 token 是否是所期待的，是则取出并返回，不是则抛异常
 * 
 * @param ExpectedToken 所期待 token 的构造函数
 * @param tokens token 序列
 * @returns 所期待的 token
 * @throws 若下一个 token 并非所期待或序列已耗尽，则抛出 `PySyntaxError`
 */
function popExpectedToken<Token extends IToken>(
    ExpectedToken: Constructor<Token>, tokens: ITokenSeq): Token {
    const expectedName = ExpectedToken.name;
    if (!tokens.hasNext()) { // tokens 已耗尽
        throw new PySyntaxError(
            `Expect ${expectedName}, but token sequence goes to end.`);
    }
    const token = tokens.goNext();
    if (!(token instanceof ExpectedToken)) { // 非所期待 token 类型
        throw new PySyntaxError(
            `Expect ${expectedName}, but get ${token.type} here.`);
    }
    return token;
}

//#region 表达式

//#region Atom
/**
 * atom ::= identifier | literal | "(" expression ")"
 * literal ::= str | int | float | true | false | none
 */
type Atom = Identifier | Literal | ParenthesesExpr;
type Literal = StrLiteral | IntLiteral | FloatLiteral
    | TrueLiteral | FalseLiteral | NoneLiteral;

class Identifier implements IGrammarSymbol {
    readonly type = 'Identifier';
    readonly name: string;
    constructor(name: string) { this.name = name; }
    repr() { return { type: this.type, name: this.name }; }
    static make(tokens: ITokenSeq): Identifier {
        const id = popExpectedToken(IdentifierToken, tokens);
        return new Identifier(id.value);
    }
}

class KeywordLiteral implements IGrammarSymbol {
    get type() { return this.constructor.name; }
    repr() { return { type: this.type }; }
}

function makeKeywordLiteral<L extends KeywordLiteral, T extends IToken>(
    Literal: Constructor<L>, Token: Constructor<T>, tokens: ITokenSeq): L {
    popExpectedToken(Token, tokens);
    return new Literal();
}

class TrueLiteral extends KeywordLiteral {
    static make(tokens: ITokenSeq): TrueLiteral {
        return makeKeywordLiteral(TrueLiteral, TrueToken, tokens);
    }
    private _ = undefined;
}

class FalseLiteral extends KeywordLiteral {
    static make(tokens: ITokenSeq): FalseLiteral {
        return makeKeywordLiteral(FalseLiteral, FalseToken, tokens);
    }
    private _ = undefined;
}

class NoneLiteral extends KeywordLiteral {
    static make(tokens: ITokenSeq): NoneLiteral {
        return makeKeywordLiteral(NoneLiteral, NoneToken, tokens);
    }
    private _ = undefined;
}

class StrLiteral implements IGrammarSymbol {
    readonly type = 'StrLiteral';
    readonly value: string;
    constructor(value: string) { this.value = value; }
    repr() { return { type: this.type, value: this.value }; }
    static make(tokens: ITokenSeq): StrLiteral {
        const str = popExpectedToken(StringToken, tokens);
        return new StrLiteral(str.getString());
    }
    private _ = undefined;
}

class IntLiteral implements IGrammarSymbol {
    readonly type = 'IntLiteral';
    readonly value: bigint;
    constructor(value: bigint) { this.value = value; }
    repr() { return { type: this.type, value: this.value }; }
    static make(tokens: ITokenSeq): IntLiteral {
        const integer = popExpectedToken(IntToken, tokens);
        return new IntLiteral(integer.getInt());
    }
    private _ = undefined;
}

class FloatLiteral implements IGrammarSymbol {
    readonly type = 'FloatLiteral';
    readonly value: number;
    constructor(value: number) { this.value = value; }
    repr() { return { type: this.type, value: this.value }; }
    static make(tokens: ITokenSeq): FloatLiteral {
        const float = popExpectedToken(FloatToken, tokens);
        return new FloatLiteral(float.getFloat());
    }
    private _ = undefined;
}

class ParenthesesExpr implements IGrammarSymbol {
    readonly type = 'ParenthesesExpr';
    readonly expression: Expression;
    constructor(expression: Expression) { this.expression = expression; }
    repr(): any { return { type: this.type, expression: this.expression.repr() }; }
    static make(tokens: ITokenSeq): ParenthesesExpr {
        popExpectedToken(LeftParenthesesToken, tokens);
        const expression = Expression.make(tokens);
        popExpectedToken(RightParenthesesToken, tokens);
        return new ParenthesesExpr(expression);
    }
    private _ = undefined;
}

const token2AtomFac = new Map<Constructor<IToken>, (tokens: ITokenSeq) => Atom>([
    [IdentifierToken, Identifier.make],
    [StringToken, StrLiteral.make],
    [IntToken, IntLiteral.make],
    [FloatToken, FloatLiteral.make],
    [TrueToken, TrueLiteral.make],
    [FalseToken, FalseLiteral.make],
    [NoneToken, NoneLiteral.make],
    [LeftParenthesesToken, ParenthesesExpr.make],
]);

function makeAtom(tokens: ITokenSeq): Atom {
    if (!tokens.hasNext()) {
        throw new PySyntaxError(
            'Expect Atom, but token sequence goes to end.');
    }
    const token = tokens.viewNext();
    for (const [TokenType, make] of token2AtomFac.entries()) {
        if (token instanceof TokenType) {
            return make(tokens);
        }
    }
    throw new PySyntaxError(`Expect Atom, but get ${token.type} here.`);
}
//#endregion

//#region Primary
/**
 * primary ::= atom {"." identifier | "[" expr_list "]" | "(" [expr_list] ")"}
 */
class Primary implements IGrammarSymbol {
    readonly type = 'Primary';
    readonly atom: Atom;
    readonly appends: PrimaryAppend[];
    constructor(atom: Atom, appends: PrimaryAppend[]) {
        this.atom = atom;
        this.appends = appends;
    }
    repr(): any {
        return {
            type: this.type,
            atom: this.atom.repr(),
            appends: this.appends.map(x => x.repr())
        };
    }
    static make(tokens: ITokenSeq): Primary {
        const isExpected = (token: IToken) =>
            token instanceof DotToken ||
            token instanceof LeftBracketToken ||
            token instanceof LeftParenthesesToken;
        const atom = makeAtom(tokens);
        const appends = [];
        while (tokens.hasNext() && isExpected(tokens.viewNext())) {
            const token = tokens.viewNext();
            if (token instanceof DotToken) {
                appends.push(AttrRefAppend.make(tokens));
            } else if (token instanceof LeftBracketToken) {
                appends.push(SubscriptionAppend.make(tokens));
            } else { // token instance of LeftParentheses
                appends.push(CallAppend.make(tokens));
            }
        }
        return new Primary(atom, appends);
    }
    private _ = undefined;
}

type PrimaryAppend = AttrRefAppend | SubscriptionAppend | CallAppend;

class AttrRefAppend implements IGrammarSymbol {
    readonly type = 'AttrRefAppend';
    readonly identifier: Identifier;
    constructor(identifier: Identifier) { this.identifier = identifier; }
    repr() { return { type: this.type, identifier: this.identifier.repr() }; }
    static make(tokens: ITokenSeq): AttrRefAppend {
        popExpectedToken(DotToken, tokens);
        const id = Identifier.make(tokens);
        return new AttrRefAppend(id);
    }
    private _ = undefined;
}

class SubscriptionAppend implements IGrammarSymbol {
    readonly type = 'SubscriptionAppend';
    readonly exprList: ExprList;
    constructor(exprList: ExprList) { this.exprList = exprList; }
    repr() { return { type: this.type, exprList: this.exprList.repr() }; }
    static make(tokens: ITokenSeq): SubscriptionAppend {
        popExpectedToken(LeftBracketToken, tokens);
        const exprList = ExprList.make(tokens);
        popExpectedToken(RightBracketToken, tokens);
        return new SubscriptionAppend(exprList);
    }
    private _ = undefined;
}

class CallAppend implements IGrammarSymbol {
    readonly type = 'CallAppend';
    readonly exprList?: ExprList;
    constructor(exprList?: ExprList) { this.exprList = exprList; }
    repr() { return { type: this.type, exprList: this.exprList?.repr() }; }
    static make(tokens: ITokenSeq): CallAppend {
        popExpectedToken(LeftParenthesesToken, tokens);
        let exprList = undefined;
        if (!(tokens.viewNext() instanceof RightParenthesesToken)) {
            exprList = ExprList.make(tokens);
        }
        popExpectedToken(RightParenthesesToken, tokens);
        return new CallAppend(exprList);
    }
    private _ = undefined;
}

/** expr_list ::= expr {"," expr} */
class ExprList implements IGrammarSymbol {
    readonly type = 'ExprList';
    readonly expressions: Expression[];
    constructor(expressions: Expression[]) { this.expressions = expressions; }
    repr(): any {
        return {
            type: this.type,
            expressions: this.expressions.map(x => x.repr())
        };
    }
    static make(tokens: ITokenSeq): ExprList {
        const expressions = [];
        const first = Expression.make(tokens);
        expressions.push(first);
        while (tokens.hasNext() && tokens.viewNext() instanceof CommaToken) {
            popExpectedToken(CommaToken, tokens);
            const e = Expression.make(tokens);
            expressions.push(e);
        }
        return new ExprList(expressions);
    }
    private _ = undefined;
}
//#endregion

//#region 幂运算
/** power ::= primary ["**" u_expr] */
class Power implements IGrammarSymbol {
    readonly type = 'Power';
    readonly primary: Primary;
    readonly uExprs: UExpr[];
    constructor(primary: Primary, uExprs: UExpr[]) {
        this.primary = primary;
        this.uExprs = uExprs;
    }
    repr(): any {
        return {
            type: this.type,
            primary: this.primary.repr(),
            uExprs: this.uExprs.map(x => x.repr())
        };
    }
    static make(tokens: ITokenSeq): Power {
        const primary = Primary.make(tokens);
        const uExprs = [];
        while (tokens.hasNext() && tokens.viewNext() instanceof PowToken) {
            popExpectedToken(PowToken, tokens);
            const uExpr = UExpr.make(tokens);
            uExprs.push(uExpr);
        }
        return new Power(primary, uExprs);
    }
    private _ = undefined;
}
//#endregion

//#region 一元算术和一元位运算
/** u_expr ::= "-" u_expr | "+" u_expr | "~" u_expr | power */
abstract class UExpr implements IGrammarSymbol {
    get type() { return this.constructor.name; }
    abstract repr(): any;
    static make(tokens: ITokenSeq): UExpr {
        if (!tokens.hasNext()) {
            throw new PySyntaxError('Tokens goes to end.');
        }
        const token = tokens.viewNext();
        if (token instanceof MinusToken
            || token instanceof PlusToken
            || token instanceof BitNotToken) {
            return UExprWithOp.make(tokens);
        } else {
            return UExprPower.make(tokens);
        }
    }
    private _abs = undefined;
}

class UExprWithOp extends UExpr {
    readonly operator: MinusToken | PlusToken | BitNotToken;
    readonly uExpr: UExpr;
    constructor(operator: MinusToken | PlusToken | BitNotToken, uExpr: UExpr) {
        super();
        this.operator = operator;
        this.uExpr = uExpr;
    }
    repr(): any {
        return {
            type: this.type,
            operator: this.operator.repr(),
            uExpr: this.uExpr.repr()
        };
    }
    static make(tokens: ITokenSeq): UExprWithOp {
        if (!tokens.hasNext()) {
            throw new PySyntaxError('Tokens goes to end.');
        }
        const op = tokens.viewNext();
        if (op instanceof MinusToken
            || op instanceof PlusToken
            || op instanceof BitNotToken) {
            const op = tokens.goNext() as (MinusToken | PlusToken | BitNotToken);
            const uExpr = UExpr.make(tokens);
            return new UExprWithOp(op, uExpr);
        } else {
            throw new PySyntaxError(`Unexpected token, get ${op.type} here.`);
        }
    }
    private _ = undefined;
}

class UExprPower extends UExpr {
    readonly power: Power;
    constructor(power: Power) { super(); this.power = power; };
    repr(): any { return { type: this.type, power: this.power.repr() }; }
    static make(tokens: ITokenSeq): UExprPower {
        return new UExprPower(Power.make(tokens));
    }
    private _ = undefined;
}
//#endregion

//#region generic classes for infix expression
/**
 * 对于 `E ::= E op T | T`，消除左递归后为 `E ::= T {op T}`，
 * 应派生如下的类用于表示非终结符 `E`:
 * 
 * ```
 * class E extends InfixExpr<Op, T> { }
 * ```
 */
class InfixExpr<Op extends IToken, T extends IGrammarSymbol>
    implements IGrammarSymbol {
    /** EBNF 中的 `T` */
    readonly expression: T;
    /** EBNF 中的 `{op T}` */
    readonly appends: InfixExprAppend<Op, T>[];
    /** 本文法符号的名字 */
    get type() { return this.constructor.name; }

    /**
     * 创建一个形如 `E ::= T {op T}` 的非终结符
     * 
     * @param expression EBNF 中的 `T`
     * @param appends EBNF 中的 `{op T}`
     */
    constructor(expression: T, appends: InfixExprAppend<Op, T>[]) {
        this.expression = expression;
        this.appends = appends;
    }

    repr(): any {
        return {
            type: this.type,
            expression: this.expression.repr(),
            appends: this.appends.map(x => x.repr())
        };
    }
}

/** 
 * 为形如 `E ::= E op1 T | E op2 T | T`（消除左递归后 
 * `E ::= T {op1 T | op2 T}`）的非终结符准备的工厂类
 * 
 * 使用方法：
 * 
 * ```
 * const eFac = new InfixExprFactory(E, [Op1, Op2], T.make);
 * ```
 */
class InfixExprFactory<
    E extends InfixExpr<Op, T>,
    Op extends IToken,
    T extends IGrammarSymbol> {
    /** `E` 的构造函数 */
    private readonly ECtor: new (expr: T, appends: InfixExprAppend<Op, T>[]) => E;
    /** 所有运算符的构造函数 */
    private readonly OpCtors: Constructor<Op>[];
    /** `T` 的工厂函数 */
    private readonly makeT: (tokens: ITokenSeq) => T;

    /**
     * 对于`E ::= E op1 T | E op2 T | ... | T`，消除左递归后
     * 为 `E ::= T {op1 T | op2 T |...}`
     * 
     * @param ECtor `E` 的构造函数
     * @param OpCtors 所有运算符的构造函数 `[op1, op2, ...]`
     * @param makeT `T` 的工厂函数
     */
    constructor(
        ECtor: new (expr: T, appends: InfixExprAppend<Op, T>[]) => E,
        OpCtors: Constructor<Op>[],
        makeT: (tokens: ITokenSeq) => T) {
        this.ECtor = ECtor;
        this.OpCtors = OpCtors;
        this.makeT = makeT;
    }

    /** 
     * 工厂函数，从 tokens 中消耗若干 token 并创建非终结符 `E`
    */
    make(tokens: ITokenSeq): E {
        const expression = this.makeT(tokens);
        const appends: InfixExprAppend<Op, T>[] = [];
        while (tokens.hasNext() && this.isExpectedOp(tokens.viewNext())) {
            const appOp = tokens.goNext() as Op;
            const appExpr = this.makeT(tokens);
            appends.push(new InfixExprAppend(appOp, appExpr));
        }
        return new this.ECtor(expression, appends);
    }

    /** 检查该 token 是否为所期待的运算符 */
    private isExpectedOp(token: IToken): boolean {
        return this.OpCtors.some(ctor => token instanceof ctor);
    }
}

/** 表示一个 `op T` 单元 */
class InfixExprAppend<Op extends IToken, T extends IGrammarSymbol>
    implements IGrammarSymbol {
    readonly type = 'InfixExprAppend';
    readonly operator: Op;
    readonly expression: T;
    constructor(operator: Op, expression: T) {
        this.operator = operator;
        this.expression = expression;
    }
    repr(): any {
        return {
            type: this.type,
            operator: this.operator.repr(),
            expression: this.expression.repr()
        };
    }
}
//#endregion

//#region 二元算术运算
/** m_expr ::= u_expr {"*" u_expr | "//" u_expr | "/" u_expr |"%" u_expr} */
type MOperator = MultiplyToken | DivIntToken | DivToken | ModToken;
class MExpr extends InfixExpr<MOperator, UExpr> { private _ = undefined; }
const mExprFac = new InfixExprFactory<MExpr, MOperator, UExpr>(
    MExpr, [MultiplyToken, DivIntToken, DivToken, ModToken], UExpr.make);

/** a_expr ::= m_expr {"+" m_expr | "-" m_expr} */
class AExpr extends InfixExpr<PlusToken | MinusToken, MExpr> { private _ = undefined; }
const aExprFac = new InfixExprFactory<AExpr, PlusToken | MinusToken, MExpr>(
    AExpr, [PlusToken, MinusToken], tokens => mExprFac.make(tokens));
//#endregion

//#region 二元位运算
/** shift_expr ::= a_expr {"<<" a_expr | ">>" a_expr} */
class ShiftExpr extends InfixExpr<ShiftLeftToken | ShiftRightToken, AExpr> {
    private _ = undefined;
}
const shiftExprFac = new InfixExprFactory<ShiftExpr, ShiftLeftToken | ShiftRightToken, AExpr>(
    ShiftExpr, [ShiftLeftToken, ShiftRightToken], tokens => aExprFac.make(tokens));

/** and_expr ::= shift_expr {"&" shift_expr} */
class AndExpr extends InfixExpr<BitAndToken, ShiftExpr> { private _ = undefined; }
const andExprFac = new InfixExprFactory(
    AndExpr, [BitAndToken], tokens => shiftExprFac.make(tokens));

/** xor_expr ::= and_expr {"^" and_expr} */
class XorExpr extends InfixExpr<BitXorToken, AndExpr> { private _ = undefined; }
const xorExprFac = new InfixExprFactory(
    XorExpr, [BitXorToken], tokens => andExprFac.make(tokens));

/** or_expr ::= xor_expr {"|" xor_expr} */
class OrExpr extends InfixExpr<BitOrToken, XorExpr> { private _ = undefined; }
const orExprFac = new InfixExprFactory(
    OrExpr, [BitOrToken], tokens => xorExprFac.make(tokens));
//#endregion

//#region 比较运算
/** comp_operator ::= "<" | ">" | "==" | ">=" | "<=" | "!=" | "is" */
type CompOperator = LessToken | LeqToken | GreaterToken | GeqToken
    | EqualsToken | NotEqualsToken | IsToken;
/** comparison ::= or_expr {comp_operator or_expr} */
class Comparison extends InfixExpr<CompOperator, OrExpr> { private _ = undefined; }
const comparisonFac = new InfixExprFactory<Comparison, CompOperator, OrExpr>(
    Comparison,
    [LessToken, LeqToken, GreaterToken, GeqToken, EqualsToken, NotEqualsToken, IsToken],
    tokens => orExprFac.make(tokens));
//#endregion

//#region 布尔运算
/** not_test ::= "not" not_test | comparison */
abstract class NotTest implements IGrammarSymbol {
    get type() { return this.constructor.name; }
    abstract repr(): any;
    static make(tokens: ITokenSeq): NotTest {
        if (!tokens.hasNext()) {
            throw new PySyntaxError('Tokens goes to end.');
        }
        const token = tokens.viewNext();
        if (token instanceof NotToken) {
            return NotTestWithOp.make(tokens);
        } else {
            return NotTestComparison.make(tokens);
        }
    }
    private _abs = undefined;
}

class NotTestWithOp extends NotTest {
    readonly operator: NotToken;
    readonly notTest: NotTest;
    constructor(operator: NotToken, notTest: NotTest) {
        super();
        this.operator = operator;
        this.notTest = notTest;
    }
    repr(): any {
        return {
            type: this.type,
            operator: this.operator.repr(),
            notTest: this.notTest.repr()
        };
    }
    static make(tokens: ITokenSeq): NotTestWithOp {
        const op = popExpectedToken(NotToken, tokens);
        const notTest = NotTest.make(tokens);
        return new NotTestWithOp(op, notTest);
    }
    private _ = undefined;
}

class NotTestComparison extends NotTest {
    readonly comparison: Comparison;
    constructor(comparison: Comparison) { super(); this.comparison = comparison; };
    repr(): any { return { type: this.type, comparison: this.comparison.repr() }; }
    static make(tokens: ITokenSeq): NotTestComparison {
        return new NotTestComparison(comparisonFac.make(tokens));
    }
    private _ = undefined;
}

/** and_test ::= not_test {"and" not_test} */
class AndTest extends InfixExpr<AndToken, NotTest> { private _ = undefined; }
const andTestFac = new InfixExprFactory(
    AndTest, [AndToken], tokens => NotTest.make(tokens));

/** or_test ::= and_test {"or" and_test} */
class OrTest extends InfixExpr<OrToken, AndTest> { private _ = undefined; }
const orTestFac = new InfixExprFactory(
    OrTest, [OrToken], tokens => andTestFac.make(tokens));
//#endregion

class Expression implements IGrammarSymbol {
    readonly type = 'Expression';
    readonly orTest: OrTest;
    constructor(orTest: OrTest) { this.orTest = orTest; }
    repr(): any { return { type: this.type, orTest: this.orTest.repr() }; }
    static make(tokens: ITokenSeq): Expression {
        const orTest = orTestFac.make(tokens);
        return new Expression(orTest);
    }
    private _ = undefined;
}
//#endregion

//#region 语句

//#region simple statement
type SimpleStmt = ExpressionStmt | AssignStmt | PassStmt
    | BreakStmt | ContinueStmt | ReturnStmt | GlobalStmt;

/** expression_stmt ::= expression newline */
class ExpressionStmt implements IGrammarSymbol {
    readonly type = 'ExpressionStmt';
    readonly expression: Expression;
    constructor(expression: Expression) { this.expression = expression; }
    repr(): any { return { type: this.type, expression: this.expression.repr() }; }
    static make(tokens: ITokenSeq): ExpressionStmt {
        const expression = Expression.make(tokens);
        popExpectedToken(NewLineToken, tokens);
        return new ExpressionStmt(expression);
    }
    private _ = undefined;
}

/** assign_stmt ::= expression "=" expression newline */
class AssignStmt implements IGrammarSymbol {
    readonly type = 'AssignStmt';
    readonly left: Expression;
    readonly right: Expression;
    constructor(left: Expression, right: Expression) {
        this.left = left;
        this.right = right;
    }
    repr(): any {
        return {
            type: this.type,
            left: this.left.repr(),
            right: this.right.repr()
        };
    }
    static make(tokens: ITokenSeq): AssignStmt {
        const left = Expression.make(tokens);
        popExpectedToken(AssignToken, tokens);
        const right = Expression.make(tokens);
        popExpectedToken(NewLineToken, tokens);
        return new AssignStmt(left, right);
    }
    private _ = undefined;
}

class KeywordStmt implements IGrammarSymbol {
    get type() { return this.constructor.name; }
    repr() { return { type: this.type }; }
}

function makeKeywordStmt<S extends SimpleStmt, T extends IToken>(
    Stmt: Constructor<S>, Token: Constructor<T>, tokens: ITokenSeq): S {
    popExpectedToken(Token, tokens);
    popExpectedToken(NewLineToken, tokens);
    return new Stmt();
}

/** pass_stmt ::= pass newline */
class PassStmt extends KeywordStmt {
    static make(tokens: ITokenSeq): PassStmt {
        return makeKeywordStmt(PassStmt, PassToken, tokens);
    }
    private _ = undefined;
}

/** break_stmt ::= "break" newline */
class BreakStmt extends KeywordStmt {
    static make(tokens: ITokenSeq): BreakStmt {
        return makeKeywordStmt(BreakStmt, BreakToken, tokens);
    }
    private _ = undefined;
}

/** continue_stmt ::= "continue" newline */
class ContinueStmt extends KeywordStmt {
    static make(tokens: ITokenSeq): ContinueStmt {
        return makeKeywordStmt(ContinueStmt, ContinueToken, tokens);
    }
    private _ = undefined;
}

/** return_stmt ::= "return" [expression] newline */
class ReturnStmt implements IGrammarSymbol {
    readonly type = 'ReturnStmt';
    readonly expression?: Expression;
    constructor(expression?: Expression) { this.expression = expression; }
    repr(): any { return { type: this.type, expression: this.expression?.repr() }; }
    static make(tokens: ITokenSeq): ReturnStmt {
        popExpectedToken(ReturnToken, tokens);
        let expression = undefined;
        if (!(tokens.viewNext() instanceof NewLineToken)) {
            expression = Expression.make(tokens);
        }
        popExpectedToken(NewLineToken, tokens);
        return new ReturnStmt(expression);
    }
    private _ = undefined;
}

/** global_stmt ::= "global" identifier_list */
class GlobalStmt implements IGrammarSymbol {
    readonly type = 'GlobalStmt';
    readonly identifiers: IdentifierList;
    constructor(identifiers: IdentifierList) { this.identifiers = identifiers; }
    repr() { return { type: this.type, identifiers: this.identifiers.repr() }; }
    static make(tokens: ITokenSeq): GlobalStmt {
        popExpectedToken(GlobalToken, tokens);
        const identifiers = IdentifierList.make(tokens);
        popExpectedToken(NewLineToken, tokens);
        return new GlobalStmt(identifiers);
    }
    private _ = undefined;
}

/** identifier_list ::= identifier {"," identifier} */
class IdentifierList implements IGrammarSymbol {
    readonly type = 'IdentifierList';
    readonly identifiers: Identifier[];
    constructor(identifiers: Identifier[]) { this.identifiers = identifiers; }
    repr() {
        return {
            type: this.type,
            identifiers: this.identifiers.map(x => x.repr())
        };
    }
    static make(tokens: ITokenSeq): IdentifierList {
        const identifiers = [];
        identifiers.push(Identifier.make(tokens));
        while (tokens.hasNext() && tokens.viewNext() instanceof CommaToken) {
            popExpectedToken(CommaToken, tokens);
            identifiers.push(Identifier.make(tokens));
        }
        return new IdentifierList(identifiers);
    }
    private _ = undefined;
}
//#endregion

//#region compound statement
type CompoundStmt = IfStmt | WhileStmt | FuncDef;

/** suite ::= indent_inc statement {statement} indent_dec */
class Suite implements IGrammarSymbol {
    readonly type = 'Suite';
    readonly statements: Statement[];
    constructor(statements: Statement[]) { this.statements = statements; }
    repr(): any {
        return {
            type: this.type,
            statements: this.statements.map(x => x.repr())
        };
    }
    static make(tokens: ITokenSeq): Suite {
        popExpectedToken(IndentIncToken, tokens);
        const statements = [];
        while (tokens.hasNext() && !(tokens.viewNext() instanceof IndentDecToken)) {
            statements.push(makeStatement(tokens));
        }
        popExpectedToken(IndentDecToken, tokens);
        return new Suite(statements);
    }
    private _ = undefined;
}

/** 
 * if_stmt ::= "if" expression ":" newline suite
 *             {"elif" expression ":" newline suite}
 *             ["else" ":" newline suite]
 */
class IfStmt implements IGrammarSymbol {
    readonly type = 'IfStmt';
    readonly ifBranch: IfBranch;
    readonly elifBranches: ElifBranch[];
    readonly elseBranch?: ElseBranch;
    constructor(ifBranch: IfBranch, elifBranches: ElifBranch[], elseBranch?: ElseBranch) {
        this.ifBranch = ifBranch;
        this.elifBranches = elifBranches;
        this.elseBranch = elseBranch;
    }
    repr() {
        return {
            type: this.type,
            ifBranch: this.ifBranch.repr(),
            elifBranches: this.elifBranches.map(x => x.repr()),
            elseBranch: this.elseBranch?.repr()
        };
    }
    static make(tokens: ITokenSeq): IfStmt {
        const ifBranch = IfBranch.make(tokens);
        const elifBranches = [];
        while (tokens.hasNext() && tokens.viewNext() instanceof ElifToken) {
            elifBranches.push(ElifBranch.make(tokens));
        }
        let elseBranch = undefined;
        if (tokens.hasNext() && tokens.viewNext() instanceof ElseToken) {
            elseBranch = ElseBranch.make(tokens);
        }
        return new IfStmt(ifBranch, elifBranches, elseBranch);
    }
    private _ = undefined;
}

class IfBranch implements IGrammarSymbol {
    readonly type = 'IfBranch';
    readonly condition: Expression;
    readonly suite: Suite;
    constructor(condition: Expression, suite: Suite) {
        this.condition = condition;
        this.suite = suite;
    }
    repr() {
        return {
            type: this.type,
            condition: this.condition.repr(),
            suite: this.suite.repr()
        };
    }
    static make(tokens: ITokenSeq): IfBranch {
        popExpectedToken(IfToken, tokens);
        const cond = Expression.make(tokens);
        popExpectedToken(ColonToken, tokens);
        popExpectedToken(NewLineToken, tokens);
        const suite = Suite.make(tokens);
        return new IfBranch(cond, suite);
    }
    private _ = undefined;
}

class ElifBranch implements IGrammarSymbol {
    readonly type = 'ElifBranch';
    readonly condition: Expression;
    readonly suite: Suite;
    constructor(condition: Expression, suite: Suite) {
        this.condition = condition;
        this.suite = suite;
    }
    repr() {
        return {
            type: this.type,
            condition: this.condition.repr(),
            suite: this.suite.repr()
        };
    }
    static make(tokens: ITokenSeq): ElifBranch {
        popExpectedToken(ElifToken, tokens);
        const cond = Expression.make(tokens);
        popExpectedToken(ColonToken, tokens);
        popExpectedToken(NewLineToken, tokens);
        const suite = Suite.make(tokens);
        return new ElifBranch(cond, suite);
    }
    private _ = undefined;
}

class ElseBranch implements IGrammarSymbol {
    readonly type = 'ElseBranch';
    readonly suite: Suite;
    constructor(suite: Suite) { this.suite = suite; }
    repr() { return { type: this.type, suite: this.suite.repr() }; }
    static make(tokens: ITokenSeq): ElseBranch {
        popExpectedToken(ElseToken, tokens);
        popExpectedToken(ColonToken, tokens);
        popExpectedToken(NewLineToken, tokens);
        const suite = Suite.make(tokens);
        return new ElseBranch(suite);
    }
    private _ = undefined;
}

/** while_stmt ::= "while" expression ":" newline suite */
class WhileStmt implements IGrammarSymbol {
    readonly type = 'WhileStmt';
    readonly condition: Expression;
    readonly suite: Suite;
    constructor(condition: Expression, suite: Suite) {
        this.condition = condition;
        this.suite = suite;
    }
    repr() {
        return {
            type: this.type,
            condition: this.condition.repr(),
            suite: this.suite.repr()
        };
    }
    static make(tokens: ITokenSeq): WhileStmt {
        popExpectedToken(WhileToken, tokens);
        const cond = Expression.make(tokens);
        popExpectedToken(ColonToken, tokens);
        popExpectedToken(NewLineToken, tokens);
        const suite = Suite.make(tokens);
        return new WhileStmt(cond, suite);
    }
    private _ = undefined;
}

/** 
 * funcdef ::= "def" identifier "(" [parameter_list] ")" ":" newline suite
 * parameter_list ::= identifier_list
 */
class FuncDef implements IGrammarSymbol {
    readonly type = 'FuncDef';
    readonly name: Identifier;
    readonly params?: IdentifierList;
    readonly suite: Suite;
    constructor(name: Identifier, params: Optional<IdentifierList>, suite: Suite) {
        this.name = name;
        this.params = params;
        this.suite = suite;
    }
    repr() {
        return {
            type: this.type,
            name: this.name.repr(),
            params: this.params?.repr(),
            suite: this.suite.repr()
        };
    }
    static make(tokens: ITokenSeq): FuncDef {
        popExpectedToken(DefToken, tokens);
        const funcName = Identifier.make(tokens);
        popExpectedToken(LeftParenthesesToken, tokens);
        let params = undefined;
        if (tokens.hasNext() && !(tokens.viewNext() instanceof RightParenthesesToken)) {
            params = IdentifierList.make(tokens);
        }
        popExpectedToken(RightParenthesesToken, tokens);
        popExpectedToken(ColonToken, tokens);
        popExpectedToken(NewLineToken, tokens);
        const suite = Suite.make(tokens);
        return new FuncDef(funcName, params, suite);
    }
    private _ = undefined;
}
//#endregion

type Statement = SimpleStmt | CompoundStmt;

function makeStatement(tokens: ITokenSeq): Statement {
    if (!tokens.hasNext()) {
        throw new PySyntaxError('Expected Statement, but tokens goes to end.');
    }
    const token = tokens.viewNext();
    if (token instanceof IfToken) {
        return IfStmt.make(tokens);
    } else if (token instanceof WhileToken) {
        return WhileStmt.make(tokens);
    } else if (token instanceof DefToken) {
        return FuncDef.make(tokens);
    } else if (token instanceof ReturnToken) {
        return ReturnStmt.make(tokens);
    } else if (token instanceof GlobalToken) {
        return GlobalStmt.make(tokens);
    } else if (token instanceof PassToken) {
        return PassStmt.make(tokens);
    } else if (token instanceof BreakToken) {
        return BreakStmt.make(tokens);
    } else if (token instanceof ContinueToken) {
        return ContinueStmt.make(tokens);
    } else {
        const e1 = Expression.make(tokens);
        if (tokens.hasNext() && tokens.viewNext() instanceof AssignToken) {
            popExpectedToken(AssignToken, tokens);
            const e2 = Expression.make(tokens);
            popExpectedToken(NewLineToken, tokens);
            return new AssignStmt(e1, e2);
        } else {
            popExpectedToken(NewLineToken, tokens);
            return new ExpressionStmt(e1);
        }
    }
}

//#endregion

/** program ::= {statement} */
class Program implements IGrammarSymbol {
    readonly type = 'Program';
    readonly statements: Statement[];
    constructor(statements: Statement[]) { this.statements = statements; }
    repr() { return { type: this.type, statements: this.statements.map(x => x.repr()) }; }
    static make(tokens: ITokenSeq): Program {
        const statements = [];
        while (tokens.hasNext()) {
            statements.push(makeStatement(tokens));
        }
        return new Program(statements);
    }
    private _ = undefined;
}

export { Program, ITokenSeq };
