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
    private _abs = undefined;
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
    private _abs = undefined;
}

class BitNotNode extends UnaryNode { get display() { return '~'; } }
class NotNode extends UnaryNode { get display() { return 'not'; } }
class PosNode extends UnaryNode { get display() { return '+'; } }
class NegNode extends UnaryNode { get display() { return '-'; } }

export { IASTNode };
