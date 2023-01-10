import Environment from "./environment";

export type ValueTypes = "null" | "number" | "boolean" | "object" | "nativeFunction" | "string"

export interface RuntimeVal {
    type: ValueTypes;
}

export interface NullValue extends RuntimeVal {
    type: "null";
    value: "null";
}

export interface StringValue extends RuntimeVal {
    type: "string";
    value: string;
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
    properties: Map<string, RuntimeVal>;
}

export interface NativeFunctionValue extends RuntimeVal {
    type: "nativeFunction";
    call: FunctionCall;
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;