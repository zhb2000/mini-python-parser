import { assert } from "../utils/enhance";

interface IASTNode {
    type: string;
    display: string;
    children: IASTNode[];
}

abstract class BinaryNode implements IASTNode {
    get type() { return this.constructor.name; }
    abstract get display(): string;
    get children() { return [this.lch, this.rch]; }
    protected readonly lch: IASTNode;
    protected readonly rch: IASTNode;
    constructor(lch: IASTNode, rch: IASTNode) {
        this.lch = lch;
        this.rch = rch;
    }
}

class AddNode extends BinaryNode { get display() { return '+'; } }
class MinusNode extends BinaryNode { get display() { return '-'; } }
class MultiplyNode extends BinaryNode { get display() { return '*'; } }
class DivNode extends BinaryNode { get display() { return '/'; } }
class DivIntNode extends BinaryNode { get display() { return '//'; } }
class ModNode extends BinaryNode { get display() { return '%'; } }
class PowNode extends BinaryNode { get display() { return '**'; } }
class ShiftLeftNode extends BinaryNode { get display() { return '<<'; } }
class ShiftRightNode extends BinaryNode { get display() { return '>>'; } }
class BitAndNode extends BinaryNode { get display() { return '&'; } }
class BitOrNode extends BinaryNode { get display() { return '|'; } }
class BitXorNode extends BinaryNode { get display() { return '^'; } }
class AndNode extends BinaryNode { get display() { return 'and'; } }
class OrNode extends BinaryNode { get display() { return 'or'; } }
class LessNode extends BinaryNode { get display() { return '<'; } }
class LeqNode extends BinaryNode { get display() { return '<='; } }
class GreaterNode extends BinaryNode { get display() { return '>'; } }
class GeqNode extends BinaryNode { get display() { return '>='; } }
class EqualsNode extends BinaryNode { get display() { return '=='; } }
class NotEqualsNode extends BinaryNode { get display() { return '!='; } }
class IsNode extends BinaryNode { get display() { return 'is'; } }
class AssignNode extends BinaryNode { get display() { return '='; } }

abstract class UnaryNode implements IASTNode {
    get type() { return this.constructor.name; }
    abstract get display(): string;
    get children() { return [this.child]; }
    protected readonly child: IASTNode;
    constructor(child: IASTNode) { this.child = child; }
}

class BitNotNode extends UnaryNode { get display() { return '~'; } }
class NotNode extends UnaryNode { get display() { return 'not'; } }
class PosNode extends UnaryNode { get display() { return '+'; } }
class NegNode extends UnaryNode { get display() { return '-'; } }

abstract class SimpleKeywordNode implements IASTNode {
    get type() { return this.constructor.name; }
    abstract get display(): string;
    readonly children = [];
}

class TrueNode extends SimpleKeywordNode { get display() { return 'True'; } }
class FalseNode extends SimpleKeywordNode { get display() { return 'False'; } }
class NoneNode extends SimpleKeywordNode { get display() { return 'None'; } }
class PassNode extends SimpleKeywordNode { get display() { return 'Pass'; } }
class BreakNode extends SimpleKeywordNode { get display() { return 'Break'; } }
class ContinueNode extends SimpleKeywordNode { get display() { return 'Continue'; } }

class IdentifierNode implements IASTNode {
    readonly type = 'IdentifierNode';
    get display() { return `id: ${this.name}`; }
    readonly children = [];
    readonly name: string;
    constructor(name: string) { this.name = name; }
}

class StrNode implements IASTNode {
    readonly type = 'IdentifierNode';
    get display() { return `str: ${this.value}`; }
    readonly children = [];
    readonly value: string;
    constructor(value: string) { this.value = value; }
}

class IntNode implements IASTNode {
    readonly type = 'IdentifierNode';
    get display() { return `int: ${this.value}`; }
    readonly children = [];
    readonly value: bigint;
    constructor(value: bigint) { this.value = value; }
}

class FloatNode implements IASTNode {
    readonly type = 'IdentifierNode';
    get display() { return `float: ${this.value}`; }
    readonly children = [];
    readonly value: number;
    constructor(value: number) { this.value = value; }
}

class AttrRefNode implements IASTNode {
    readonly type = 'AttrRefNode';
    readonly display = 'AttrRef obj.attr';
    get children() { return [this.object, this.attr]; }
    readonly object: IASTNode;
    readonly attr: IdentifierNode;
    constructor(object: IASTNode, attr: IdentifierNode) {
        this.object = object;
        this.attr = attr;
    }
}

class SubscriptionNode implements IASTNode {
    readonly type = 'SubscriptionNode';
    readonly display = 'Subscription obj[args...]';
    get children() { return [this.object, this.args]; }
    readonly object: IASTNode;
    readonly args: ArgsNode;
    constructor(object: IASTNode, args: ArgsNode) {
        assert(args.args.length >= 1);
        this.object = object;
        this.args = args;
    }
}

class CallNode implements IASTNode {
    readonly type = 'SubscriptionNode';
    readonly display = 'Subscription callee[args...]';
    get children() { return [this.callee, this.args]; }
    readonly callee: IASTNode;
    readonly args: ArgsNode;
    constructor(callee: IASTNode, args: ArgsNode) {
        this.callee = callee;
        this.args = args;
    }
}

class ArgsNode implements IASTNode {
    readonly type = 'ArgsNode';
    readonly display = 'args';
    get children() { return this.args; }
    readonly args: IASTNode[];
    constructor(args: IASTNode[]) { this.args = args; }
}

class ReturnNode implements IASTNode {
    readonly type = 'ReturnNode';
    readonly display = 'return';
    get children() { return this.expr != null ? [this.expr] : []; }
    readonly expr?: IASTNode;
    constructor(expr?: IASTNode) { this.expr = expr; }
}

class GlobalNode implements IASTNode {
    readonly type = 'GlobalNode';
    readonly display = 'global';
    get children() { return this.identifiers; }
    readonly identifiers: IdentifierNode[];
    constructor(identifiers: IdentifierNode[]) {
        assert(identifiers.length >= 1);
        this.identifiers = identifiers;
    }
}

class SuiteNode implements IASTNode {
    readonly type = 'SuiteNode';
    readonly display = 'suite';
    get children() { return this.statements; }
    readonly statements: IASTNode[];
    constructor(statements: IASTNode[]) {
        assert(statements.length >= 1);
        this.statements = statements;
    }
}

class WhileNode implements IASTNode {
    readonly type = 'WhileNode';
    readonly display = 'while';
    get children() { return [this.condition, this.suite]; }
    readonly condition: IASTNode;
    readonly suite: SuiteNode;
    constructor(condition: IASTNode, suite: SuiteNode) {
        this.condition = condition;
        this.suite = suite;
    }
}

class IfBranchNode implements IASTNode {
    readonly type = 'IfBranchNode';
    readonly display = 'if';
    get children() { return [this.condition, this.suite]; }
    readonly condition: IASTNode;
    readonly suite: SuiteNode;
    constructor(condition: IASTNode, suite: SuiteNode) {
        this.condition = condition;
        this.suite = suite;
    }
}

class ElifBranchNode implements IASTNode {
    readonly type = 'ElifBranchNode';
    readonly display = 'elif';
    get children() { return [this.condition, this.suite]; }
    readonly condition: IASTNode;
    readonly suite: SuiteNode;
    constructor(condition: IASTNode, suite: SuiteNode) {
        this.condition = condition;
        this.suite = suite;
    }
}

class ElseBranchNode implements IASTNode {
    readonly type = 'ElseBranchNode';
    readonly display = 'else';
    get children() { return [this.suite]; }
    readonly suite: SuiteNode;
    constructor(suite: SuiteNode) { this.suite = suite; }
}

class IfElifElseNode implements IASTNode {
    readonly type = 'IfElifElseNode';
    readonly display = 'if-elif-else';
    get children() {
        const arr: IASTNode[] = [this.ifBranch, ...this.elifBranches];
        if (this.elseBranch != null) {
            arr.push(this.elseBranch);
        }
        return arr;
    }
    readonly ifBranch: IfBranchNode;
    readonly elifBranches: ElifBranchNode[];
    readonly elseBranch?: ElseBranchNode;
    constructor(
        ifBranch: IfBranchNode,
        elifBranches: ElifBranchNode[],
        elseBranch?: ElseBranchNode) {
        this.ifBranch = ifBranch;
        this.elifBranches = elifBranches;
        this.elseBranch = elseBranch;
    }
}

class FuncDefNode implements IASTNode {
    readonly type = 'FuncDefNode';
    readonly display = 'def';
    get children() { return [this.funcName, this.params, this.suite]; }
    readonly funcName: IdentifierNode;
    readonly params: ParamsNode;
    readonly suite: SuiteNode;
    constructor(
        funcName: IdentifierNode,
        params: ParamsNode,
        suite: SuiteNode) {
        this.funcName = funcName;
        this.params = params;
        this.suite = suite;
    }
}

class ParamsNode implements IASTNode {
    readonly type = 'ParamsNode';
    readonly display = 'params';
    get children() { return this.params; }
    readonly params: IdentifierNode[];
    constructor(params: IdentifierNode[]) { this.params = params; }
}

class ProgramNode implements IASTNode {
    readonly type = 'ProgramNode';
    readonly display = 'program';
    get children() { return this.statements; }
    readonly statements: IASTNode[];
    constructor(statements: IASTNode[]) { this.statements = statements; }
}

export {
    IASTNode,
    AddNode,
    MinusNode,
    MultiplyNode,
    DivNode,
    DivIntNode,
    ModNode,
    PowNode,
    ShiftLeftNode,
    ShiftRightNode,
    BitAndNode,
    BitOrNode,
    BitXorNode,
    AndNode,
    OrNode,
    LessNode,
    LeqNode,
    GreaterNode,
    GeqNode,
    EqualsNode,
    NotEqualsNode,
    IsNode,
    AssignNode,
    BitNotNode,
    NotNode,
    PosNode,
    NegNode,
    TrueNode,
    FalseNode,
    NoneNode,
    PassNode,
    BreakNode,
    ContinueNode,
    IdentifierNode,
    StrNode,
    IntNode,
    FloatNode,
    AttrRefNode,
    SubscriptionNode,
    CallNode,
    ArgsNode,
    ReturnNode,
    GlobalNode,
    SuiteNode,
    WhileNode,
    IfBranchNode,
    ElifBranchNode,
    ElseBranchNode,
    IfElifElseNode,
    FuncDefNode,
    ParamsNode,
    ProgramNode
};
