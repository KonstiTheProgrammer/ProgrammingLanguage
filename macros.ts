import {BooleanValue, FunctionCall, NativeFunctionValue, NullValue, NumberValue} from "./runtime/values.ts";

export function MAKE_NUMBER(value: number): NumberValue {
    return {value: value, type: "number"} as NumberValue;
}

export function MAKE_NULL(): NullValue {
    return {value: "null", type: "null"} as NullValue;
}

export function MAKE_BOOLEAN(value: boolean): BooleanValue {
    return {value: value, type: "boolean"} as BooleanValue;
}

export function MAKE_NATIVE_FN(call: FunctionCall){
    return {call: call, type: "nativeFunction"} as NativeFunctionValue;
}