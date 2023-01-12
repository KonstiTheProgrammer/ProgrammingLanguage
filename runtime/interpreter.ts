import {
    AssignmentExpression,
    BinaryExpression, CallExpression, FunctionDeclaration,
    Identifier,
    NumericLiteral, ObjectLiteral,
    Program,
    Statement, StringLiteral,
    VariableDeclaration
} from "../transpiler/ast";
import {FunctionValue, NativeFunctionValue, NumberValue, ObjectValue, RuntimeVal, StringValue} from "./values";
import Environment from "./environment";
import {evaluateBinaryExpression} from "./evaluation/evaluateBinaryExpression";
import {evaluateProgram} from "./evaluation/evaluateProgram";
import {evaluateIdentifier} from "./evaluation/evaluateIdentifier";
import {evaluateVariableDeclaration} from "./evaluation/evaluateVariableDeclaration";
import {MAKE_NULL, MAKE_NUMBER} from "../macros";

export function evaluateAssignment(node: AssignmentExpression, env: Environment): RuntimeVal {
    if (node.assignee.kind !== "Identifier") {
        throw `Invalid assignment expr ${JSON.stringify(node.assignee)}`;
    }
    const varname = (node.assignee as Identifier).symbol;
    return env.assignVariable(varname, evaluateStatement(node.value, env));
}


export function evaluateObjectExpression(object: ObjectLiteral, env: Environment): RuntimeVal {
    const obj: ObjectValue = {
        type: "object",
        properties: new Map<string, RuntimeVal>()
    }

    for (const property of object.properties) {
        const runtimeVal = (property.value == undefined) ?
            env.lookupVariable(property.key) :
            evaluateStatement(property.value, env);

        obj.properties.set(property.key, runtimeVal);
    }

    return obj;
}

export function evaluateCallExpression(expression: CallExpression, env: Environment): RuntimeVal {
    const args = expression.args.map((arg) => evaluateStatement(arg, env));
    const fn = evaluateStatement(expression.caller, env);

    if (fn.type == "nativeFunction") {
        return (fn as NativeFunctionValue).call(args, env);
    }

    if (fn.type == "function") {
        const func = fn as FunctionValue;
        const scopeEnv = new Environment(func.declarationEnv);

        func.args.forEach((arg, index) => {
            scopeEnv.declareVariable(arg, args[index], false);
        });

        let result: RuntimeVal = MAKE_NULL();
        func.body.forEach((statement) => {
            result = evaluateStatement(statement, scopeEnv)
        });

        return result;
    }

    throw new Error(`Invalid function call ${JSON.stringify(expression)}`);
}

function evaluateFunctionDeclaration(node: FunctionDeclaration, env: Environment): RuntimeVal {
    const fn: FunctionValue = {
        type: "function",
        name: node.name,
        args: node.args,
        body: node.body,
        declarationEnv: env
    }

    env.declareVariable(
        fn.name,
        fn,
        true
    );

    return MAKE_NULL();
}


export function evaluateStatement(Node: Statement, env: Environment): RuntimeVal {
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
        case "FunctionDeclaration":
            return evaluateFunctionDeclaration(Node as FunctionDeclaration, env);
        case "ObjectLiteral":
            return evaluateObjectExpression(Node as ObjectLiteral, env);
        case "Program":
            return evaluateProgram(Node as Program, env);
        default:
            throw new Error("Unknown expression type:" + JSON.stringify(Node));
    }
}