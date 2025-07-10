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

export interface NodeProps<T extends Record<string, NodeProxy<string>> = {}> {
        id?: string
        args?: any[]
        type?: string
        children?: any[]
        inferFrom?: any[]
        layout?: FnLayout
        parent?: NodeProxy<string>
        // for struct
        fields?: T
        initialValues?: T
}

export interface NodeContext {
        gl?: Partial<GL>
        isFrag?: boolean
        isWebGL?: boolean
        binding?: number
        infers?: WeakMap<NodeProxy<any>, Constants>
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
 * infer
 */
type InferOperatorType<L extends Constants, R extends Constants> = L extends R
        ? L
        : L extends 'vec2' | 'vec3' | 'vec4'
        ? R extends 'float' | 'int'
                ? L
                : L
        : R extends 'vec2' | 'vec3' | 'vec4'
        ? L extends 'float' | 'int'
                ? R
                : R
        : 'float'

type StringLength<S extends string> = S extends `${infer _}${infer Rest}`
        ? Rest extends ''
                ? 1
                : Rest extends `${infer _}${infer Rest2}`
                ? Rest2 extends ''
                        ? 2
                        : Rest2 extends `${infer _}${infer Rest3}`
                        ? Rest3 extends ''
                                ? 3
                                : 4
                        : never
                : never
        : 0

type InferSwizzleType<S extends string> = StringLength<S> extends 4
        ? 'vec4'
        : StringLength<S> extends 3
        ? 'vec3'
        : StringLength<S> extends 2
        ? 'vec2'
        : 'float'

/**
 * Swizzles
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
        | '__nodeType'

type ReadNodeProxy = {
        [K in string as K extends NodeProxyMethods ? never : K]: any
} & {
        [K in Swizzles]: NodeProxy<InferSwizzleType<K>>
}

interface BaseNodeProxy<T extends Constants> {
        // System properties
        assign(x: any): NodeProxy<T>
        toVar(name?: string): NodeProxy<T>
        toString(c?: NodeContext): string
        type: NodeTypes
        props: NodeProps
        isProxy: true
        listeners: Set<(value: any) => void>
        __nodeType: T

        // Operators methods
        add<U extends Constants>(x: X<U>): NodeProxy<InferOperatorType<T, U>>
        sub<U extends Constants>(x: X<U>): NodeProxy<InferOperatorType<T, U>>
        mul<U extends Constants>(x: X<U>): NodeProxy<InferOperatorType<T, U>>
        div<U extends Constants>(x: X<U>): NodeProxy<InferOperatorType<T, U>>
        mod<U extends Constants>(x: X<U>): NodeProxy<InferOperatorType<T, U>>
        equal<U extends Constants>(x: X<U>): NodeProxy<'bool'>
        notEqual<U extends Constants>(x: X<U>): NodeProxy<'bool'>
        lessThan<U extends Constants>(x: X<U>): NodeProxy<'bool'>
        lessThanEqual<U extends Constants>(x: X<U>): NodeProxy<'bool'>
        greaterThan<U extends Constants>(x: X<U>): NodeProxy<'bool'>
        greaterThanEqual<U extends Constants>(x: X<U>): NodeProxy<'bool'>
        and(x: X<'bool'>): NodeProxy<'bool'>
        or(x: X<'bool'>): NodeProxy<'bool'>
        not(): NodeProxy<'bool'>

        // Bitwise operators
        bitAnd(x: X<T>): NodeProxy<T>
        bitOr(x: X<T>): NodeProxy<T>
        bitXor(x: X<T>): NodeProxy<T>
        bitNot(): NodeProxy<T>
        shiftLeft<U extends Constants>(x: X<U>): NodeProxy<InferOperatorType<T, U>>
        shiftRight<U extends Constants>(x: X<U>): NodeProxy<InferOperatorType<T, U>>

        // Conversion methods
        toBool(): NodeProxy<'bool'>
        toUint(): NodeProxy<'uint'>
        toInt(): NodeProxy<'int'>
        toFloat(): NodeProxy<'float'>
        toBvec2(): NodeProxy<'bvec2'>
        toIvec2(): NodeProxy<'ivec2'>
        toUvec2(): NodeProxy<'uvec2'>
        toVec2(): NodeProxy<'vec2'>
        toBvec3(): NodeProxy<'bvec3'>
        toIvec3(): NodeProxy<'ivec3'>
        toUvec3(): NodeProxy<'uvec3'>
        toVec3(): NodeProxy<'vec3'>
        toBvec4(): NodeProxy<'bvec4'>
        toIvec4(): NodeProxy<'ivec4'>
        toUvec4(): NodeProxy<'uvec4'>
        toVec4(): NodeProxy<'vec4'>
        toColor(): NodeProxy<'color'>
        toMat2(): NodeProxy<'mat2'>
        toMat3(): NodeProxy<'mat3'>
        toMat4(): NodeProxy<'mat4'>

        // Mathematical function methods (preserve type functions)
        abs(): NodeProxy<T>
        sign(): NodeProxy<T>
        floor(): NodeProxy<T>
        ceil(): NodeProxy<T>
        round(): NodeProxy<T>
        fract(): NodeProxy<T>
        trunc(): NodeProxy<T>
        sin(): NodeProxy<T>
        cos(): NodeProxy<T>
        tan(): NodeProxy<T>
        asin(): NodeProxy<T>
        acos(): NodeProxy<T>
        atan(): NodeProxy<T>
        exp(): NodeProxy<T>
        exp2(): NodeProxy<T>
        log(): NodeProxy<T>
        log2(): NodeProxy<T>
        sqrt(): NodeProxy<T>
        inverseSqrt(): NodeProxy<T>
        normalize(): NodeProxy<T>
        oneMinus(): NodeProxy<T>
        saturate(): NodeProxy<T>
        negate(): NodeProxy<T>
        reciprocal(): NodeProxy<T>
        dFdx(): NodeProxy<T>
        dFdy(): NodeProxy<T>
        fwidth(): NodeProxy<T>

        // Scalar return functions
        length(): NodeProxy<'float'>
        lengthSq(): NodeProxy<'float'>
        determinant(): NodeProxy<'float'>
        luminance(): NodeProxy<'float'>

        // Bool return functions
        all(): NodeProxy<'bool'>
        any(): NodeProxy<'bool'>

        // Specific return type functions
        cross<U extends Constants>(y: X<U>): NodeProxy<'vec3'>

        // Two argument functions with variable return types
        atan2<U extends Constants>(x: X<U>): NodeProxy<T>
        pow<U extends Constants>(y: X<U>): NodeProxy<T>
        distance<U extends Constants>(y: X<U>): NodeProxy<'float'>
        dot<U extends Constants>(y: X<U>): NodeProxy<'float'>
        reflect<U extends Constants>(N: X<U>): NodeProxy<T>
        refract<U extends Constants>(N: X<U>, eta: any): NodeProxy<T>

        // Multi-argument functions that return highest priority type
        min<U extends Constants>(y: X<U>): NodeProxy<InferOperatorType<T, U>>
        max<U extends Constants>(y: X<U>): NodeProxy<InferOperatorType<T, U>>
        mix<U extends Constants, V>(y: X<U>, a: V): NodeProxy<InferOperatorType<T, U>>
        clamp<U extends Constants, V>(mix: X<U>, max: V): NodeProxy<InferOperatorType<T, U>>
        step<U extends Constants>(edge: X<U>): NodeProxy<InferOperatorType<T, U>>
        smoothstep<U extends Constants, V>(edge0: X<U>, edge1: V): NodeProxy<InferOperatorType<T, U>>

        // Power functions
        pow2(): NodeProxy<T>
        pow3(): NodeProxy<T>
        pow4(): NodeProxy<T>
}

export type NodeProxy<T extends Constants = string> = BaseNodeProxy<T> & ReadNodeProxy

export type X<T extends Constants = string> = number | string | boolean | undefined | NodeProxy<T> | X[]
