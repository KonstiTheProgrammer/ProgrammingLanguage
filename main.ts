import {Parser} from "./transpiler/parser.ts";
import {tokenize} from "./transpiler/lexer.ts";
import {evaluateExpression} from "./runtime/interpreter.ts";
import Environment from "./runtime/environment.ts";
import readTextFile = Deno.readTextFile;

repl();

async function repl() {
    const parser = new Parser();
    const env = Environment.createDefaultEnvironment();
    const input = await readTextFile("input.txt");
    if (!input || input.includes("exit")) Deno.exit(0);
    const program = parser.produceAst(tokenize(input));
    console.log(JSON.stringify(program, null, 2));
    const result = evaluateExpression(program, env);
    console.log(result);
}