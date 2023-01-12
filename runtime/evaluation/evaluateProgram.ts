import {Program} from "../../transpiler/ast";
import Environment from "../environment";
import {RuntimeVal} from "../values";
import {MAKE_NULL} from "../../macros";
import {evaluateStatement} from "../interpreter";

export function evaluateProgram(program: Program, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = MAKE_NULL(); //default

    for (const statement of program.body) {
        lastEvaluated = evaluateStatement(statement, env);
    }

    return lastEvaluated;
}