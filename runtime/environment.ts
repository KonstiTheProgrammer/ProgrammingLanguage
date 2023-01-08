import {RuntimeVal} from "./values.ts";
import {MAKE_BOOLEAN, MAKE_NULL} from "../macros.ts";

function setScope(env: Environment) {
    env.declareVariable("true", MAKE_BOOLEAN(true), true);
    env.declareVariable("false", MAKE_BOOLEAN(false), true);
    env.declareVariable("null", MAKE_NULL(), true);
}

export default class Environment {
    parent?: Environment;
    private variables: Map<string, RuntimeVal> = new Map();
    private constants: Set<string> = new Set<string>();

    constructor(parent?: Environment) {
        if (!parent) setScope(this);
        this.parent = parent;
    }


    public declareVariable(name: string, value: RuntimeVal, isConstant: boolean): RuntimeVal {
        if (this.variables.has(name)) throw new Error(`Variable ${name} already declared`);
        if (isConstant) this.constants.add(name);
        this.variables.set(name, value);
        return value;
    }

    public assignVariable(name: string, value: RuntimeVal): RuntimeVal {
        const env = this.resolveEnvironmentByVarName(name);

        if (env.variables.has(name)) {
            if (env.constants.has(name)) throw new Error(`Variable ${name} is constant`);
            env.variables.set(name, value);
            return value;
        }

        throw new Error(`Variable ${name} not declared`);
    }

    public lookupVariable(varName: string): RuntimeVal {
        const env = this.resolveEnvironmentByVarName(varName);
        return env.variables.get(varName) as RuntimeVal;
    }

    public resolveEnvironmentByVarName(varName: string): Environment {
        if (this.variables.has(varName)) return this;
        if (this.parent) return this.parent.resolveEnvironmentByVarName(varName);
        throw new Error(`Variable ${varName} not declared`);
    }
}