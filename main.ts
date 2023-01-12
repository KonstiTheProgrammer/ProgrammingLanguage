import {Parser} from "./transpiler/parser";
import {tokenize} from "./transpiler/lexer";
import {evaluateStatement} from "./runtime/interpreter";
import Environment from "./runtime/environment";
const fs = require("fs");


execute();

function execute() {
    const parser = new Parser();
    const env = Environment.createDefaultEnvironment();
    const input = fs.readFileSync("input.txt", "utf8");
    if (!input || input.includes("exit")) throw "No input was specified"
    const program = parser.produceAst(tokenize(input));
    console.log(JSON.stringify(program, null, 2));
    const result = evaluateStatement(program, env);
    console.log(result);
}