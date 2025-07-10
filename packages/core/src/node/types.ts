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

export interface NodeProxyBase<T extends Constants = any> {
        type: NodeTypes
        props: any
        isProxy: true
        listeners: Set<(value: any) => void>
        __nodeType: T
}

export type ExtractConstants<T extends Constants = any> = T extends { __nodeType: infer U }
        ? U extends Constants
                ? U
                : 'float'
        : 'float'

export interface NodeProps {
        id?: string
        args?: any[]
        type?: string
        children?: any[]
        inferFrom?: any[]
        layout?: FnLayout
        parent?: NodeProxy<any>
        // for struct
        fields?: Record<string, NodeProxy<any>>
        initialValues?: Record<string, NodeProxy<any>>
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
type InferOperatorType<L extends Constants, R extends Constants, Op extends string> = Op extends
        | 'equal'
        | 'notEqual'
        | 'lessThan'
        | 'lessThanEqual'
        | 'greaterThan'
        | 'greaterThanEqual'
        ? 'bool'
        : Op extends 'and' | 'or'
        ? 'bool'
        : L extends R
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

type InferSwizzleType<S extends string> = S extends `${string}${string}${string}${string}`
        ? 'vec4'
        : S extends `${string}${string}${string}`
        ? 'vec3'
        : S extends `${string}${string}`
        ? 'vec2'
        : 'float'

type InferFunctionReturn<F extends string, Args extends readonly Constants[]> = F extends
        | 'dot'
        | 'distance'
        | 'length'
        | 'lengthSq'
        ? 'float'
        : F extends 'all' | 'any'
        ? 'bool'
        : F extends 'cross'
        ? 'vec3'
        : F extends 'texture' | 'cubeTexture' | 'textureSize'
        ? 'vec4'
        : Args[0]

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

export interface BaseNodeProxy<T extends Constants> {
        // System properties
        assign(n: any): NodeProxy<T>
        toVar(name?: string): NodeProxy<T>
        toString(c?: NodeContext): string
        type: NodeTypes
        props: NodeProps
        isProxy: true
        listeners: Set<(value: any) => void>
        __nodeType: T // 型推論のための隠れプロパティ

        // Operators methods
        add<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'add'>>
        sub<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'sub'>>
        mul<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'mul'>>
        div<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'div'>>
        mod<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'mod'>>
        equal<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'equal'>>
        notEqual<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'notEqual'>>
        lessThan<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'lessThan'>>
        lessThanEqual<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'lessThanEqual'>>
        greaterThan<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'greaterThan'>>
        greaterThanEqual<U extends Constants>(
                n: U
        ): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'greaterThanEqual'>>
        and<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'and'>>
        or<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'or'>>
        not(): NodeProxy<'bool'>

        // Bitwise operators
        bitAnd<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'bitAnd'>>
        bitOr<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'bitOr'>>
        bitXor<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'bitXor'>>
        bitNot(): NodeProxy<T>
        shiftLeft<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'shiftLeft'>>
        shiftRight<U extends Constants>(n: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'shiftRight'>>

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
        cross<U extends Constants>(y: U): NodeProxy<'vec3'>

        // Two argument functions with variable return types
        atan2<U extends Constants>(x: U): NodeProxy<InferFunctionReturn<'atan2', [T, ExtractConstants<U>]>>
        pow<U extends Constants>(y: U): NodeProxy<InferFunctionReturn<'pow', [T, ExtractConstants<U>]>>
        distance<U extends Constants>(y: U): NodeProxy<'float'>
        dot<U extends Constants>(y: U): NodeProxy<'float'>
        reflect<U extends Constants>(N: U): NodeProxy<T>
        refract<U extends Constants>(N: U, eta: any): NodeProxy<T>

        // Multi-argument functions that return highest priority type
        min<U extends Constants>(y: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'add'>>
        max<U extends Constants>(y: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'add'>>
        mix<U extends Constants, V>(y: U, a: V): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'add'>>
        clamp<U extends Constants, V>(min: U, max: V): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'add'>>
        step<U extends Constants>(edge: U): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'add'>>
        smoothstep<U extends Constants, V>(
                edge0: U,
                edge1: V
        ): NodeProxy<InferOperatorType<T, ExtractConstants<U>, 'add'>>

        // Power functions
        pow2(): NodeProxy<T>
        pow3(): NodeProxy<T>
        pow4(): NodeProxy<T>
}

export type NodeProxy<T extends Constants = any> = NodeProxyBase<T> & ReadNodeProxy

export type X<T extends Constants = any> = number | string | boolean | undefined | NodeProxy<T> | X[]
