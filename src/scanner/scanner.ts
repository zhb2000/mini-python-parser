import { isdigit, isalpha, isString } from '../utils/strutils';
import { Optional } from '../utils/typing';
import { IndentInc, IndentDec, NewLine, PyChar } from './preprocessor';
import { Position } from './token';

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
            this.strMap.get(key);
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
    nodeDict = new Map<string, INode>();
    private addNode(name: string, acceptable: boolean,
        char2NodeName: PyCharMap<string>) {
        const that = this;
        const node = {
            name, acceptable, char2NodeName,
            to(ch: PyChar) {
                const key = this.char2NodeName.get(ch);
                return (key != null) ? that.nodeDict.get(key) : undefined;
            }
        };
        this.nodeDict.set(name, node);
    }
    constructor() {
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
                    [':', 'd13']
                ]))
        );
        //c2
        this.nodeDict.set('c2', {
            name: 'c2', acceptable: false,
            to(ch: PyChar) {
                const key = (ch instanceof NewLine) ? 'c3' : 'c2';
                return that.nodeDict.get(key);
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
        this.addNode('n3', false,
            new PyCharMap<string>().setDigitValue('n4')
        );
        //n4
        this.addNode('n4', true,
            new PyCharMap<string>().setDigitValue('n4')
        );
        //s5
        this.nodeDict.set('s5', {
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
                return (key != null) ? that.nodeDict.get(key) : undefined;
            }
        });
        //s6
        this.nodeDict.set('s6', {
            name: 's6', acceptable: false,
            to(ch: PyChar) {
                return (!(ch instanceof NewLine))
                    ? that.nodeDict.get('s5') : undefined;
            }
        });
        //s4
        this.addNode('s4', true, new PyCharMap());
        //s2
        this.nodeDict.set('s2', {
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
                return (key != null) ? that.nodeDict.get(key) : undefined;
            }
        });
        //s3
        this.nodeDict.set('s3', {
            name: 's3', acceptable: false,
            to(ch: PyChar) {
                return (!(ch instanceof NewLine))
                    ? that.nodeDict.get('s2') : undefined;
            }
        });
        //TODO
    }
}

export { Position };
