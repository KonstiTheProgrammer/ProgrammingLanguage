import {Identifier} from "../../transpiler/ast";
import Environment from "../environment";

export function evaluateIdentifier(node: Identifier, env: Environment) {
    return env.lookupVariable(node.symbol);
}