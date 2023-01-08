import {
    AssignmentExpression,
    BinaryExpression,
    Identifier,
    NumericLiteral,
    Program,
    Statement,
    VariableDeclaration
} from "../transpiler/ast.ts";
import {NumberVal, RuntimeVal} from "./values.ts";
import Environment from "./environment.ts";
import {evaluateBinaryExpression} from "./evaluation/evaluateBinaryExpression.ts";
import {evaluateProgram} from "./evaluation/evaluateProgram.ts";
import {evaluateIdentifier} from "./evaluation/evaluateIdentifier.ts";
import {evaluateVariableDeclaration} from "./evaluation/evaluateVariableDeclaration.ts";

export function evaluateAssignment(node: AssignmentExpression, env: Environment): RuntimeVal {
    if (node.assignee.kind !== "Identifier") {
        throw `Invalid LHS inaide assignment expr ${JSON.stringify(node.assignee)}`;
    }
    const varname = (node.assignee as Identifier).symbol;
    return env.assignVariable(varname, evaluateExpression(node.value, env));
}


export function evaluateExpression(Node: Statement, env: Environment): RuntimeVal {
    switch (Node.kind) {
        case "NumericLiteral":
            return {value: (Node as NumericLiteral).value, type: "number"} as NumberVal;
        case "AssignmentExpression":
            return evaluateAssignment(Node as AssignmentExpression, env);
        case "Identifier":
            return evaluateIdentifier(Node as Identifier, env);
        case "BinaryExpression":
            return evaluateBinaryExpression(Node as BinaryExpression, env);
        case "VariableDeclaration":
            return evaluateVariableDeclaration(Node as VariableDeclaration, env);
        case "Program":
            return evaluateProgram(Node as Program, env);
        default:
            throw new Error("Unknown expression type");
    }
}