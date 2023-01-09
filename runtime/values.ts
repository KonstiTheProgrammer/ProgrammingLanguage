import ValueType = WebAssembly.ValueType;
import Environment from "./environment.ts";

export type ValueTypes = "null" | "number" | "boolean" | "object" | "nativeFunction"

export interface RuntimeVal {
    type: ValueType;
}

export interface NullValue extends RuntimeVal {
    type: "null";
    value: "null";
}

export interface NumberValue extends RuntimeVal {
    type: "number";
    value: number;
}

export interface BooleanValue extends RuntimeVal {
    type: "boolean";
    value: boolean;
}

export interface ObjectValue extends RuntimeVal {
    type: "object";
    value: Map<string, RuntimeVal>;
}

export interface NativeFunctionValue extends RuntimeVal {
    type: "nativeFunction";
    call: FunctionCall;
}
export type FunctionCall = (args: RuntimeVal[], env : Environment) => RuntimeVal;