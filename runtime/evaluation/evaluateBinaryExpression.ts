import {BinaryExpression} from "../../transpiler/ast";
import Environment from "../environment";
import {NullValue, NumberValue, RuntimeVal} from "../values";
import {evaluateStatement} from "../interpreter";

export function evaluateBinaryExpression(binaryExpression: BinaryExpression, env: Environment): RuntimeVal {
    const leftSide = evaluateStatement(binaryExpression.left, env) as NumberValue;
    const rightSide = evaluateStatement(binaryExpression.right, env) as NumberValue;

    if (leftSide.type === "number" && rightSide.type === "number") {
        const leftNumber = leftSide.value;
        const rightNumber = rightSide.value;
        switch (binaryExpression.operator) {
            case "+":
                return {type: "number", value: leftNumber + rightNumber} as NumberValue;
            case "-":
                return {type: "number", value: leftNumber - rightNumber} as NumberValue;
            case "*":
                return {type: "number", value: leftNumber * rightNumber} as NumberValue;
            case "/": {
                if (rightNumber === 0) throw new Error("Division by zero");
                return {type: "number", value: leftNumber / rightNumber} as NumberValue;
            }
            case "%" :
                return {type: "number", value: leftNumber % rightNumber} as NumberValue;
            default:
                throw new Error("Unknown binary operator");
        }
    } //else
      //throw new Error("Both sides of a operation must be a number");

    return {type: "null", value: "null"} as NullValue;
}