import { GL } from '../types'
import { CONSTANTS, CONVERSIONS, FUNCTIONS, OPERATOR_KEYS } from './const'

export type Constants = (typeof CONSTANTS)[number] | 'void'

export type Conversions = (typeof CONVERSIONS)[number]

export type Functions = (typeof FUNCTIONS)[number]

export type Operators = (typeof OPERATOR_KEYS)[number]

export interface FnLayout {
        name: string
        type: Constants | 'auto'
        inputs?: Array<{
                name: string
                type: Constants
        }>
}

/**
 * Node
 */
export type NodeTypes =
        // headers
        | 'attribute'
        | 'uniform'
        | 'constant'
        // variables
        | 'variable'
        | 'varying'
        | 'ternary'
        | 'builtin'
        | 'conversion'
        | 'operator'
        | 'function'
        // struct
        | 'struct'
        | 'member'
        // scopes
        | 'scope'
        | 'assign'
        | 'loop'
        | 'define'
        | 'if'
        | 'switch'
        | 'declare'
        | 'return'

export interface NodeProps {
        id?: string
        args?: X[]
        type?: string
        children?: X[]
        inferFrom?: X[]
        layout?: FnLayout
        parent?: NodeProxy
        // for struct
        fields?: Record<string, NodeProxy>
        initialValues?: Record<string, NodeProxy>
}

export interface NodeContext {
        gl?: Partial<GL>
        isFrag?: boolean
        isWebGL?: boolean
        binding?: number
        infers?: WeakMap<NodeProxy, Constants>
        onMount?: (name: string) => void
        code?: {
                headers: Map<string, string>
                fragInputs: Map<string, string>
                vertInputs: Map<string, string>
                vertOutputs: Map<string, string>
                vertVaryings: Map<string, string>
                dependencies: Map<string, Set<string>>
        }
}

/**
 * NodeProxy
 */
type _Swizzles<T extends string> = T | `${T}${T}` | `${T}${T}${T}` | `${T}${T}${T}${T}`

export type Swizzles =
        | _Swizzles<'x' | 'y' | 'z' | 'w'>
        | _Swizzles<'r' | 'g' | 'b' | 'a'>
        | _Swizzles<'p' | 'q'>
        | _Swizzles<'s' | 't'>

type NodeProxyMethods =
        | Functions
        | Operators
        | Conversions
        | Swizzles
        // system property
        | 'type'
        | 'props'
        | 'isProxy'
        | 'assign'
        | 'toVar'
        | 'toString'

export type ReadNodeProxy = {
        [K in string as K extends NodeProxyMethods ? never : K]: X
}

export interface BaseNodeProxy extends Record<Swizzles, NodeProxy> {
        // System properties
        assign(n: X): NodeProxy
        toVar(name?: string): NodeProxy
        toString(c?: NodeContext): string
        type: NodeTypes
        props: NodeProps
        isProxy: true
        listeners: Set<(value: any) => void>

        // Operators methods
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

        // Conversations methods
        toBool(): NodeProxy
        toUint(): NodeProxy
        toInt(): NodeProxy
        toFloat(): NodeProxy
        toBvec2(): NodeProxy
        toIvec2(): NodeProxy
        toUvec2(): NodeProxy
        toVec2(): NodeProxy
        toBvec3(): NodeProxy
        toIvec3(): NodeProxy
        toUvec3(): NodeProxy
        toVec3(): NodeProxy
        toBvec4(): NodeProxy
        toIvec4(): NodeProxy
        toUvec4(): NodeProxy
        toVec4(): NodeProxy
        toColor(): NodeProxy
        toMat2(): NodeProxy
        toMat3(): NodeProxy
        toMat4(): NodeProxy

        // Function methods
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
}

export type NodeProxy = BaseNodeProxy & ReadNodeProxy

export type X = X[] | (NodeProxy | number | string | boolean | undefined)
