import ValueType = WebAssembly.ValueType;

export type ValueTypes = "null" | "number" | "boolean";

export interface RuntimeVal {
    type: ValueType;
}

export interface NullVal extends RuntimeVal {
    value: "null";
}

export interface NumberVal extends RuntimeVal {
    value: number;
}

export interface BooleanVal extends RuntimeVal {
    value: boolean;
}