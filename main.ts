import {Parser} from "./transpiler/parser.ts";
import {tokenize} from "./transpiler/lexer.ts";
import {evaluateExpression} from "./runtime/interpreter.ts";
import Environment from "./runtime/environment.ts";
import readTextFile = Deno.readTextFile;

repl();

async function repl() {
    const parser = new Parser();
    const env = new Environment();

    const input = await readTextFile("input.txt");
    if (!input || input.includes("exit")) Deno.exit(0);
    const program = parser.produceAst(tokenize(input));
    console.log(program)
    const result = evaluateExpression(program, env);
    console.log(result);
}