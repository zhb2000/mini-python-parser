import { Scanner } from './scanner/scanner';
import { Parser } from './parser/parser';
import * as scannerTest from '../test/scanner/scannerTestCases';


console.log('I am in main');

let text = scannerTest.cases[0].input;
// text = '123aab'

// const scanner = new Scanner();
// const tokens = scanner.scan(text);
const parser = new Parser();
const program = parser.toParseTree(text);
console.log(program);
