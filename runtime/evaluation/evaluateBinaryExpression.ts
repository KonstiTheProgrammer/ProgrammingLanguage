import {BinaryExpression} from "../../transpiler/ast.ts";
import Environment from "../environment.ts";
import {RuntimeVal} from "../values.ts";
import {evaluateExpression} from "../interpreter.ts";

export function evaluateBinaryExpression(binaryExpression: BinaryExpression, env: Environment): RuntimeVal {
    const leftSide = evaluateExpression(binaryExpression.left, env);
    const rightSide = evaluateExpression(binaryExpression.right, env);

    if (leftSide.type === "number" && rightSide.type === "number") {
        const leftNumber = leftSide.value;
        const rightNumber = rightSide.value;
        switch (binaryExpression.operator) {
            case "+":
                return {type: "number", value: leftNumber + rightNumber};
            case "-":
                return {type: "number", value: leftNumber - rightNumber};
            case "*":
                return {type: "number", value: leftNumber * rightNumber};
            case "/": {
                if (rightNumber === 0) throw new Error("Division by zero");
                return {type: "number", value: leftNumber / rightNumber};
            }
            case "%" :
                return {type: "number", value: leftNumber % rightNumber};
            default:
                throw new Error("Unknown binary operator");
        }
    }

    return {type: "null", value: "null"};
}