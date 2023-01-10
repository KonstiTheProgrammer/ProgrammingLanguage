import {VariableDeclaration} from "../../transpiler/ast";
import Environment from "../environment";
import {MAKE_NULL} from "../../macros";
import {evaluateExpression} from "../interpreter";
import {RuntimeVal} from "../values";

export function evaluateVariableDeclaration(node: VariableDeclaration, env: Environment): RuntimeVal {
    const value = node.value ? evaluateExpression(node.value, env) : MAKE_NULL();
    return env.declareVariable(node.identifier, value, node.isConstant);
}