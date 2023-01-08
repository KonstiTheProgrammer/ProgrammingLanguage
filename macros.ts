import {BooleanVal, NullVal, NumberVal} from "./runtime/values.ts";

export function MAKE_NUMBER(value: number): NumberVal {
    return {value: value, type: "number"} as NumberVal;
}

export function MAKE_NULL(): NullVal {
    return {value: "null", type: "null"} as NullVal;
}

export function MAKE_BOOLEAN(value: boolean): BooleanVal {
    return {value: value, type: "boolean"} as BooleanVal;
}