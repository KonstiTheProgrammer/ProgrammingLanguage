import {Program} from "../../transpiler/ast.ts";
import Environment from "../environment.ts";
import {RuntimeVal} from "../values.ts";
import {MAKE_NULL} from "../../macros.ts";
import {evaluateExpression} from "../interpreter.ts";

export function evaluateProgram(program: Program, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = MAKE_NULL(); //default

    for (const statement of program.body) {
        lastEvaluated = evaluateExpression(statement, env);
    }

    return lastEvaluated;
}