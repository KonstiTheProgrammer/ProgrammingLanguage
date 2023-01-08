import {VariableDeclaration} from "../../transpiler/ast.ts";
import Environment from "../environment.ts";
import {MAKE_NULL} from "../../macros.ts";
import {evaluateExpression} from "../interpreter.ts";
import {RuntimeVal} from "../values.ts";

export function evaluateVariableDeclaration(node: VariableDeclaration, env: Environment): RuntimeVal {
    const value = node.value ? evaluateExpression(node.value, env) : MAKE_NULL();
    return env.declareVariable(node.identifier, value, node.isConstant);
}