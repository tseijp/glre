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

export interface NodeProps<T extends Record<string, NodeProxy> = {}> {
        id?: string
        args?: any[]
        type?: string
        children?: any[]
        inferFrom?: any[]
        layout?: FnLayout
        parent?: NodeProxy
        // for struct
        fields?: T
        initialValues?: T
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
 * infer
 */
// Unified logic with infer.ts inferOperator function
// prettier-ignore
type InferOperator<L extends Constants, R extends Constants> =
        L extends R ? L :
        L extends 'float' | 'int' ? R :
        R extends 'float' | 'int' ? L :
        L extends 'mat4' ? R extends 'vec4' ? 'vec4' : L :
        L extends 'mat3' ? R extends 'vec3' ? 'vec3' : L :
        L extends 'mat2' ? R extends 'vec2' ? 'vec2' : L :  L

type _StringLength<S extends string> = S extends `${infer _}${infer Rest}`
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

type InferSwizzleType<S extends string> = _StringLength<S> extends 4
        ? 'vec4'
        : _StringLength<S> extends 3
        ? 'vec3'
        : _StringLength<S> extends 2
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
        add<U extends Constants>(x: X<U>): NodeProxy<InferOperator<T, U>>
        sub<U extends Constants>(x: X<U>): NodeProxy<InferOperator<T, U>>
        mul<U extends Constants>(x: X<U>): NodeProxy<InferOperator<T, U>>
        div<U extends Constants>(x: X<U>): NodeProxy<InferOperator<T, U>>
        mod<U extends Constants>(x: X<U>): NodeProxy<InferOperator<T, U>>
        equal<U extends Constants>(x: X<U>): Bool
        notEqual<U extends Constants>(x: X<U>): Bool
        lessThan<U extends Constants>(x: X<U>): Bool
        lessThanEqual<U extends Constants>(x: X<U>): Bool
        greaterThan<U extends Constants>(x: X<U>): Bool
        greaterThanEqual<U extends Constants>(x: X<U>): Bool
        and(x: X<'bool'>): Bool
        or(x: X<'bool'>): Bool
        not(): Bool

        // Bitwise operators
        bitAnd(x: X<T>): NodeProxy<T>
        bitOr(x: X<T>): NodeProxy<T>
        bitXor(x: X<T>): NodeProxy<T>
        bitNot(): NodeProxy<T>
        shiftLeft<U extends Constants>(x: X<U>): NodeProxy<InferOperator<T, U>>
        shiftRight<U extends Constants>(x: X<U>): NodeProxy<InferOperator<T, U>>

        // Conversion methods
        toBool(): Bool
        toUint(): UInt
        toInt(): Int
        toFloat(): Float
        toBvec2(): BVec2
        toIvec2(): IVec2
        toUvec2(): UVec2
        toVec2(): Vec2
        toBvec3(): BVec3
        toIvec3(): IVec3
        toUvec3(): UVec3
        toVec3(): Vec3
        toBvec4(): BVec4
        toIvec4(): IVec4
        toUvec4(): UVec4
        toVec4(): Vec4
        toColor(): Color
        toMat2(): Mat2
        toMat3(): Mat3
        toMat4(): Mat4

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
        length(): Float
        lengthSq(): Float
        determinant(): Float
        luminance(): Float

        // Bool return functions
        all(): Bool
        any(): Bool

        // Specific return type functions
        cross<U extends Constants>(y: X<U>): Vec3

        // Two argument functions with variable return types
        atan2<U extends Constants>(x: X<U>): NodeProxy<T>
        pow<U extends Constants>(y: X<U>): NodeProxy<T>
        distance<U extends Constants>(y: X<U>): Float
        dot<U extends Constants>(y: X<U>): Float
        reflect<U extends Constants>(N: X<U>): NodeProxy<T>
        refract<U extends Constants>(N: X<U>, eta: any): NodeProxy<T>

        // Multi-argument functions that return highest priority type
        min<U extends Constants>(y: X<U>): NodeProxy<InferOperator<T, U>>
        max<U extends Constants>(y: X<U>): NodeProxy<InferOperator<T, U>>
        mix<U extends Constants, V>(y: X<U>, a: V): NodeProxy<InferOperator<T, U>>
        clamp<U extends Constants, V>(mix: X<U>, max: V): NodeProxy<InferOperator<T, U>>
        step<U extends Constants>(edge: X<U>): NodeProxy<InferOperator<T, U>>
        smoothstep<U extends Constants, V>(edge0: X<U>, edge1: V): NodeProxy<InferOperator<T, U>>

        // Power functions
        pow2(): NodeProxy<T>
        pow3(): NodeProxy<T>
        pow4(): NodeProxy<T>
}

type ReadNodeProxy = {
        [K in string as K extends NodeProxyMethods ? never : K]: any
} & {
        [K in Swizzles]: NodeProxy<InferSwizzleType<K>>
}

// Internal NodeProxy implementation (renamed from original)
type NodeProxyImpl<T extends Constants = string> = BaseNodeProxy<T> & ReadNodeProxy

export type Bool = NodeProxyImpl<'bool'>
export type UInt = NodeProxyImpl<'uint'>
export type Int = NodeProxyImpl<'int'>
export type Float = NodeProxyImpl<'float'>
export type BVec2 = NodeProxyImpl<'bvec2'>
export type IVec2 = NodeProxyImpl<'ivec2'>
export type UVec2 = NodeProxyImpl<'uvec2'>
export type Vec2 = NodeProxyImpl<'vec2'>
export type BVec3 = NodeProxyImpl<'bvec3'>
export type IVec3 = NodeProxyImpl<'ivec3'>
export type UVec3 = NodeProxyImpl<'uvec3'>
export type Vec3 = NodeProxyImpl<'vec3'>
export type BVec4 = NodeProxyImpl<'bvec4'>
export type IVec4 = NodeProxyImpl<'ivec4'>
export type UVec4 = NodeProxyImpl<'uvec4'>
export type Vec4 = NodeProxyImpl<'vec4'>
export type Color = NodeProxyImpl<'color'>
export type Mat2 = NodeProxyImpl<'mat2'>
export type Mat3 = NodeProxyImpl<'mat3'>
export type Mat4 = NodeProxyImpl<'mat4'>
export type Texture = NodeProxyImpl<'texture'>
export type Sampler2D = NodeProxyImpl<'sampler2D'>
export type Struct = NodeProxyImpl<'struct'>

export interface ConstantsToType {
        bool: Bool
        uint: UInt
        int: Int
        float: Float
        bvec2: BVec2
        ivec2: IVec2
        uvec2: UVec2
        vec2: Vec2
        bvec3: BVec3
        ivec3: IVec3
        uvec3: UVec3
        vec3: Vec3
        bvec4: BVec4
        ivec4: IVec4
        uvec4: UVec4
        vec4: Vec4
        color: Color
        mat2: Mat2
        mat3: Mat3
        mat4: Mat4
        texture: Texture
        sampler2D: Sampler2D
        struct: Struct
}

export type NodeProxy<T extends Constants = string> = T extends keyof ConstantsToType
        ? ConstantsToType[T]
        : NodeProxyImpl<T>

export type X<T extends Constants = string> = number | string | boolean | undefined | NodeProxy<T> | X[]
