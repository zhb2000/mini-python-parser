import { Parser } from './parser/parser.js';
import * as io from './debugio/printer.js';
import * as scannerTest from '../test/scanner/scannerTestCases.js';


console.log('I am in main');

let text;
text = scannerTest.cases[0].input;
text = '1 ** 2 ** 3';

const parser = new Parser();
const program = parser.toParseTree(text);

const astJson = io.jsonString(program.toASTNode().repr());
console.log(astJson);
