import { Parser } from './parser/parser';
import * as io from './debugio/printer';
import * as scannerTest from '../test/scanner/scannerTestCases';


console.log('I am in main');

let text;
text = scannerTest.cases[0].input;
text = '';

const parser = new Parser();
const program = parser.toParseTree(text);

const astJson = io.jsonString(program.toASTNode().repr());
console.log(astJson);
