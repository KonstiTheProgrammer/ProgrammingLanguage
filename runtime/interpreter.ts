import {
    AssignmentExpression,
    BinaryExpression, CallExpression,
    Identifier,
    NumericLiteral, ObjectLiteral,
    Program,
    Statement, StringLiteral,
    VariableDeclaration
} from "../transpiler/ast";
import {NativeFunctionValue, NumberValue, ObjectValue, RuntimeVal, StringValue} from "./values";
import Environment from "./environment";
import {evaluateBinaryExpression} from "./evaluation/evaluateBinaryExpression";
import {evaluateProgram} from "./evaluation/evaluateProgram";
import {evaluateIdentifier} from "./evaluation/evaluateIdentifier";
import {evaluateVariableDeclaration} from "./evaluation/evaluateVariableDeclaration";

export function evaluateAssignment(node: AssignmentExpression, env: Environment): RuntimeVal {
    if (node.assignee.kind !== "Identifier") {
        throw `Invalid assignment expr ${JSON.stringify(node.assignee)}`;
    }
    const varname = (node.assignee as Identifier).symbol;
    return env.assignVariable(varname, evaluateExpression(node.value, env));
}


export function evaluateObjectExpression(object: ObjectLiteral, env: Environment): RuntimeVal {
    const obj: ObjectValue = {
        type: "object",
        properties: new Map<string, RuntimeVal>()
    }

    for (const property of object.properties) {
        const runtimeVal = (property.value == undefined) ?
            env.lookupVariable(property.key) :
            evaluateExpression(property.value, env);

        obj.properties.set(property.key, runtimeVal);
    }

    return obj;
}

export function evaluateCallExpression(expression: CallExpression, env: Environment): RuntimeVal {
    const args = expression.args.map((arg) => evaluateExpression(arg, env));
    const fn = evaluateExpression(expression.caller, env);

    if (fn.type !== "nativeFunction") {
        throw `Invalid function call ${expression.caller}`;
    }

    const result = (fn as NativeFunctionValue).call(args, env);
    return result;
}

export function evaluateExpression(Node: Statement, env: Environment): RuntimeVal {
    switch (Node.kind) {
        case "NumericLiteral":
            return {value: (Node as NumericLiteral).value, type: "number"} as NumberValue;
        case "StringLiteral":
            return {value: (Node as StringLiteral).value, type: "string"} as StringValue;
        case "AssignmentExpression":
            return evaluateAssignment(Node as AssignmentExpression, env);
        case "Identifier":
            return evaluateIdentifier(Node as Identifier, env);
        case "CallExpression":
            return evaluateCallExpression(Node as CallExpression, env);
        case "BinaryExpression":
            return evaluateBinaryExpression(Node as BinaryExpression, env);
        case "VariableDeclaration":
            return evaluateVariableDeclaration(Node as VariableDeclaration, env);
        case "ObjectLiteral":
            return evaluateObjectExpression(Node as ObjectLiteral, env);
        case "Program":
            return evaluateProgram(Node as Program, env);
        default:
            throw new Error("Unknown expression type:" + JSON.stringify(Node));
    }
}