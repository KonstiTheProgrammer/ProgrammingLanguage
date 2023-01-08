import {Identifier} from "../../transpiler/ast.ts";
import Environment from "../environment.ts";

export function evaluateIdentifier(node: Identifier, env: Environment) {
    return env.lookupVariable(node.symbol);
}