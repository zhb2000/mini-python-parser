import { Scanner } from './scanner/scanner';
import { Parser } from './parser/parser';
import * as io from './debugio/printer';
import * as scannerTest from '../test/scanner/scannerTestCases';


console.log('I am in main');

let text;
text = scannerTest.cases[0].input;
// text = '123 or aab';
// text = 'a = True';

// const scanner = new Scanner();
// const tokens = scanner.scan(text);
const parser = new Parser();
const program = parser.toParseTree(text);
// const progStr = io.jsonString(program.repr());
// console.log(progStr);

const astStr = io.jsonString(program.toASTNode().repr());
console.log(astStr);
