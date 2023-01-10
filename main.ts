import {Parser} from "./transpiler/parser";
import {tokenize} from "./transpiler/lexer";
import {evaluateExpression} from "./runtime/interpreter";
import Environment from "./runtime/environment";

execute();

function execute() {
    const parser = new Parser();
    const env = Environment.createDefaultEnvironment();
    const input = "print(12)";
    if (!input || input.includes("exit")) throw "No input was specified"
    const program = parser.produceAst(tokenize(input));
    console.log(JSON.stringify(program, null, 2));
    const result = evaluateExpression(program, env);
    console.log(result);
}