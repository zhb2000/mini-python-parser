import { isdigit, isalpha } from '../utils/strutils';
import { asNonNull, Optional } from '../utils/typing';
import { itertools, map, range } from '../utils/pylike';
import { IndentInc, IndentDec, NewLine, PyChar } from './preprocessor';

/** key 为 PyChar 的 Map */
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

/** DFA 状态节点 */
interface INode {
    /** 状态名称 */
    readonly name: string;
    /** 是否为可接受状态 */
    readonly acceptable: boolean;
    /** 接受字符 `ch` 后转移到的状态，若无法转移则返回 `undefined` */
    to(ch: PyChar): Optional<INode>;
}

class Automaton {
    /** 状态名称 -> 状态节点 */
    private readonly nodes = new Map<string, INode>();
    /** 当前状态节点指针 */
    private cursor: INode;

    constructor() {
        this.initNodes();
        this.cursor = asNonNull(this.nodes.get('1'));
    }

    /** 能否消耗字符 `ch` */
    canConsume(ch: PyChar): boolean { return this.cursor.to(ch) != null; }

    /** 消耗字符 `ch` 并转移状态 */
    consume(ch: PyChar) { this.cursor = asNonNull(this.cursor.to(ch)); }

    /** 当前状态 */
    current(): INode { return this.cursor; }

    /** 让 cursor 返回初始状态 */
    reset() { this.cursor = asNonNull(this.nodes.get('1')); }

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
            name: 'c2', acceptable: true,
            to(ch: PyChar) {
                return (ch instanceof NewLine) ? undefined : that.nodes.get('c2');
            }
        });
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

export { Automaton };
