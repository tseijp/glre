import { CONSTANTS, CONVERSIONS, FUNCTIONS, OPERATOR_KEYS } from './const'

export type Constants = (typeof CONSTANTS)[number] | 'void'

export type Conversions = (typeof CONVERSIONS)[number]

export type Functions = (typeof FUNCTIONS)[number]

export type Operators = (typeof OPERATOR_KEYS)[number]

export interface NodeProps {
        id?: string
        args?: X[]
        type?: string
        children?: X[]
        value?: number | number[] | boolean
        inferFrom?: X
}

export interface NodeConfig {
        isWebGL?: boolean
        binding?: number
        infers?: WeakMap<NodeProxy, Constants>
        headers?: Map<string, string>
        onMount?: (name: string, value: any) => void
}

type _Swizzles<T extends string> = T | `${T}${T}` | `${T}${T}${T}` | `${T}${T}${T}${T}`

export type Swizzles =
        | _Swizzles<'x' | 'y' | 'z' | 'w'>
        | _Swizzles<'r' | 'g' | 'b' | 'a'>
        | _Swizzles<'p' | 'q'>
        | _Swizzles<'s' | 't'>

export type NodeTypes =
        | 'uniform'
        | 'variable'
        | 'swizzle'
        | 'operator'
        | 'conversion'
        | 'function'
        | 'declare'
        | 'assign'
        | 'define'
        | 'if'
        | 'loop'
        | 'scope'
        | 'switch'
        | 'ternary'
        | 'attribute'
        | 'varying'
        | 'builtin'
        | 'constant'

export interface NodeProxy extends Record<Swizzles | Conversions, NodeProxy> {
        // Operators
        add(n: X): NodeProxy
        sub(n: X): NodeProxy
        mul(n: X): NodeProxy
        div(n: X): NodeProxy
        mod(n: X): NodeProxy
        equal(n: X): NodeProxy
        notEqual(n: X): NodeProxy
        lessThan(n: X): NodeProxy
        lessThanEqual(n: X): NodeProxy
        greaterThan(n: X): NodeProxy
        greaterThanEqual(n: X): NodeProxy
        and(n: X): NodeProxy
        or(n: X): NodeProxy
        not(): NodeProxy

        // Variable manipulation
        assign(n: X): NodeProxy
        toVar(name?: string): NodeProxy
        toConst(name?: string): NodeProxy

        // Math function methods
        abs(): NodeProxy
        sin(): NodeProxy
        cos(): NodeProxy
        tan(): NodeProxy
        asin(): NodeProxy
        acos(): NodeProxy
        atan(): NodeProxy
        atan2(x: X): NodeProxy
        pow(y: X): NodeProxy
        pow2(): NodeProxy
        pow3(): NodeProxy
        pow4(): NodeProxy
        sqrt(): NodeProxy
        inverseSqrt(): NodeProxy
        exp(): NodeProxy
        exp2(): NodeProxy
        log(): NodeProxy
        log2(): NodeProxy
        floor(): NodeProxy
        ceil(): NodeProxy
        round(): NodeProxy
        fract(): NodeProxy
        trunc(): NodeProxy
        min(y: X): NodeProxy
        max(y: X): NodeProxy
        clamp(min: X, max: X): NodeProxy
        saturate(): NodeProxy
        mix(y: X, a: X): NodeProxy
        step(edge: X): NodeProxy
        smoothstep(edge0: X, edge1: X): NodeProxy
        length(): NodeProxy
        distance(y: X): NodeProxy
        dot(y: X): NodeProxy
        cross(y: X): NodeProxy
        normalize(): NodeProxy
        reflect(N: X): NodeProxy
        refract(N: X, eta: X): NodeProxy
        sign(): NodeProxy
        oneMinus(): NodeProxy
        reciprocal(): NodeProxy
        negate(): NodeProxy
        dFdx(): NodeProxy
        dFdy(): NodeProxy
        fwidth(): NodeProxy

        // System properties
        toString(c?: NodeConfig): string
        type: NodeTypes
        props: NodeProps
        isProxy: true
}

export type X = NodeProxy | number | string | boolean | undefined
