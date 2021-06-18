import * as strutils from '../utils/strutils.js';
import { enumerate, range } from '../utils/pylike.js';
import { IPosition } from './token.js';
import { PySyntaxError } from '../errors.js';

/** 换行，相当于其他语言里的分号 */
class NewLine { toString() { return 'NewLine'; } private _ = undefined; }
/** 缩进增，相当于其他语言里的左花括号 */
class IndentInc { toString() { return 'IndentInc'; } private _ = undefined; }
/** 缩进减，相当于其他语言里的左花括号 */
class IndentDec { toString() { return 'IndentDec'; } private _ = undefined; }
/** 预处理后的字符类型 */
type PyChar = string | NewLine | IndentInc | IndentDec;

/** 表示一段字符或一个字符 */
class CharSequence {
    /** 
     * 一段字符或一个字符：
     * 
     * - `string` 类型表示一段字符
     * - `NewLine` `IndentInc` `IndentDec` 类型表示一个字符
     */
    data: string | NewLine | IndentInc | IndentDec;
    /** 字符段或字符的位置 */
    position: IPosition;
    constructor(data: string | NewLine | IndentInc | IndentDec,
        position: IPosition) {
        this.data = data;
        this.position = position;
    }
}

/**
 * 将一行代码分为缩进、代码两部分
 * 
 * @param line 一行源代码
 * @param lineNumber 行号
 * @returns [缩进段, 代码段]
 */
function splitLine(line: string, lineNumber: number): [CharSequence[], CharSequence[]] {
    line = line.trimRight();
    //缩进段，每个 CharSequence 表示一个缩进
    const indents: CharSequence[] = [];
    let spaceCnt = 0;
    let i = 0;
    //遍历 line 前面的缩进部分
    while (i < line.length && strutils.isBlank(line[i])) {
        //将四个空格或一个 Tab 视为一个缩进单位
        if (line[i] === ' ') {
            spaceCnt++;
            if (spaceCnt === 4) {
                indents.push({
                    data: new IndentInc(),
                    position: { line: lineNumber, start: i - 3, stop: i + 1 }
                });
                spaceCnt = 0;
            }
        } else if (line[i] === '\t') {
            if (spaceCnt != 0) {
                throw new PySyntaxError(`Indent error at line ${lineNumber + 1}.`);
            }
            indents.push({
                data: new IndentInc(),
                position: { line: lineNumber, start: i, stop: i + 1 }
            });
        }
        i++;
    }
    if (spaceCnt != 0) {
        throw new PySyntaxError(`Indent error at line ${lineNumber + 1}.`);
    }
    const codeStr = line.trim();
    //代码段，第一个 CharSequence 表示代码部分，第二个 CharSequence 表示换行
    const codes: CharSequence[] = [
        {   //实际代码
            data: codeStr,
            position: {
                line: lineNumber,
                start: i,
                stop: i + codeStr.length
            }
        },
        {   //换行
            data: new NewLine(),
            position: {
                line: lineNumber,
                start: i + codeStr.length,
                stop: i + codeStr.length
            }
        }
    ];
    return [indents, codes];
}

function makeCharSequences(text: string): CharSequence[] {
    text = text.replace('\r\n', '\n').replace('\r', '\n');
    const lines = text.split('\n');
    const sequences: CharSequence[] = [];
    let lastIndentNum = 0; //上一行缩进数目
    for (const [lineNumber, line] of enumerate(lines)) {
        if (strutils.isBlank(line)) { //忽略空行
            continue;
        }
        if (/^#.*$/.test(line.trim())) { //忽略全注释行
            continue;
        }
        const [indents, codes] = splitLine(line, lineNumber);
        const indentNum = indents.length;
        if (indentNum === lastIndentNum) {
            //缩进不变
            sequences.push(...codes);
        } else if (indentNum < lastIndentNum) {
            //缩进减
            for (const _ of range(lastIndentNum - indentNum)) {
                sequences.push({
                    data: new IndentDec(),
                    position: { line: lineNumber, start: 0, stop: 0 }
                });
            }
            sequences.push(...codes);
        } else { //indentNum > lastIndentNum
            //缩进增
            for (let i = indents.length - 1;
                i > indents.length - 1 - (indentNum - lastIndentNum);
                i--) {
                sequences.push(indents[i]);
            }
            sequences.push(...codes);
        }
        lastIndentNum = indentNum;
    }
    //到达末尾，插入缩进减
    if (lastIndentNum > 0) {
        for (const _ of range(lastIndentNum)) {
            sequences.push({
                data: new IndentDec(),
                position: { line: lines.length + 1, start: 0, stop: 0 }
            });
        }
    }
    return sequences;
}

/** 预处理后的源代码 */
class SourceCode {
    private sequences: CharSequence[];

    constructor(text: string) {
        this.sequences = makeCharSequences(text);
    }

    *iterCharsWithPos(): Iterable<[IPosition, PyChar]> {
        for (const seq of this.sequences) {
            if (strutils.isString(seq.data)) { // CharSequence 装着一段字符
                for (const [i, ch] of enumerate(
                    seq.data as string, seq.position.start)) {
                    yield [{ line: seq.position.line, start: i, stop: i + 1 }, ch];
                }
            } else { // CharSequence 装着一个字符
                yield [seq.position, seq.data];
            }
        }
    }
}

export {
    PyChar,
    NewLine,
    IndentInc,
    IndentDec,
    SourceCode,
    makeCharSequences,
    CharSequence,
};
