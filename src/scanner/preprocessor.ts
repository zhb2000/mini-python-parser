import * as strutils from '../utils/strutils';
import { enumerate, range } from '../utils/pylike';
import { Position } from './scanner';
import { PySyntaxError } from './error';

class NewLine {
    toString(): string {
        return 'NewLine';
    }
}

class IndentInc {
    toString(): string {
        return 'IndentInc';
    }
}

class IndentDec {
    toString(): string {
        return 'IndentDec';
    }
}

type PyChar = string | NewLine | IndentInc | IndentDec;

class CharSequence {
    data: string | NewLine | IndentInc | IndentDec;
    line: number;
    start: number;
    stop: number;
    constructor(data: string | NewLine | IndentInc | IndentDec,
        line: number, start: number, stop: number) {
        this.data = data;
        this.line = line;
        this.start = start;
        this.stop = stop;
    }
}

/**
 * 将一行代码分为缩进、代码两部分
 */
function splitLine(line: string, lineNumber: number): [CharSequence[], CharSequence[]] {
    line = line.trimRight();
    const indents: CharSequence[] = [];
    let spaceCnt = 0;
    let i = 0;
    //前面的缩进
    while (i < line.length && strutils.isBlank(line[i])) {
        if (line[i] === ' ') {
            spaceCnt++;
            if (spaceCnt === 4) {
                indents.push({
                    data: new IndentInc(),
                    line: lineNumber, start: i - 3, stop: i + 1
                });
                spaceCnt = 0;
            }
        } else if (line[i] === '\t') {
            if (spaceCnt != 0) {
                //TODO
                throw new PySyntaxError('Indent error');
            }
            indents.push({
                data: new IndentInc(),
                line: lineNumber, start: i, stop: i + 1
            });
        }
        i++;
    }
    const codeStr = line.trim();
    const codes: CharSequence[] = [
        {   //实际代码
            data: codeStr,
            line: lineNumber,
            start: i, stop: i + codeStr.length
        },
        {   //换行
            data: new NewLine(),
            line: lineNumber,
            start: i + codeStr.length,
            stop: i + codeStr.length
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
                    line: lineNumber, start: 0, stop: 0
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
                line: lines.length + 1, start: 0, stop: 0
            });
        }
    }
    return sequences;
}

class SourceCode {
    sequences: CharSequence[];

    constructor(text: string) {
        this.sequences = makeCharSequences(text);
    }

    *iterCharsWithPos(): Iterable<[Position, PyChar]> {
        for (const seq of this.sequences) {
            if (strutils.isString(seq.data)) {
                for (const [i, ch] of enumerate(seq.data as string, seq.start)) {
                    yield [{ line: seq.line, start: i, stop: i + 1 }, ch];
                }
            } else {
                yield [
                    { line: seq.line, start: seq.start, stop: seq.stop }, seq.data
                ];
            }
        }
    }

    *iterChars(): Iterable<PyChar> {
        for (const [_, ch] of this.iterCharsWithPos()) {
            yield ch;
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
