import { CONSTANTS, CONVERSIONS, FUNCTIONS, OPERATOR_KEYS } from './utils/const'
import type { GL } from '../types'

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
        | 'storage'
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
        | 'element'
        | 'gather'
        | 'scatter'
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
        args?: any[]
        type?: string
        children?: any[]
        inferFrom?: any[]
        layout?: FnLayout
        // for struct
        fields?: StructFields
        initialValues?: StructFields
}

export interface NodeContext {
        gl?: Partial<GL>
        label?: 'vert' | 'frag' | 'compute'
        isWebGL?: boolean
        units?: any // @TODO FIX
        infers?: WeakMap<NodeProxy, Constants>
        onMount?: (name: string) => void
        code?: {
                headers: Map<string, string>
                fragInputs: Map<string, string>
                vertInputs: Map<string, string>
                vertOutputs: Map<string, string>
                vertVaryings: Map<string, string>
                computeInputs: Map<string, string>
                dependencies: Map<string, Set<string>>
                structFields: Map<string, StructFields>
        }
}

/**
 * infer
 */
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

// Unified logic with infer.ts inferOperator function
// prettier-ignore
type InferOperator<L extends Constants, R extends Constants> =
        L extends R ? L :
        // broadcast
        L extends 'float' | 'int' ? R :
        R extends 'float' | 'int' ? L :
        // mat * vec → vec
        L extends 'mat4' ? R extends 'vec4' ? R /* default */ : L :
        L extends 'mat3' ? R extends 'vec3' ? R /* default */ : L :
        L extends 'mat2' ? R extends 'vec2' ? R /* default */ : L :
        // vec * mat → vec
        L extends 'vec4' ? R extends 'mat4' ? L /* default */ : L :
        L extends 'vec3' ? R extends 'mat3' ? L /* default */ : L :
        L extends 'vec2' ? R extends 'mat2' ? L /* default */ : L : L

// Unified logic with infer.ts inferArrayElement function
// prettier-ignore
type InferArrayElement<T extends Constants> =
        T extends 'mat4' ? 'vec4' :
        T extends 'mat3' ? 'vec3' :
        T extends 'mat2' ? 'vec2' :
        'float'

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
        | 'element'

type ReadNodeProxy = {
        [K in string as K extends NodeProxyMethods ? never : K]: any
} & {
        [K in Swizzles]: NodeProxy<InferSwizzleType<K>>
}

// Internal NodeProxy implementation (renamed from original)
type NodeProxyImpl<T extends Constants> = BaseNodeProxy<T> & ReadNodeProxy

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
export type StructFields = Record<string, NodeProxy>
export type StructNode<T extends StructFields> = Omit<Struct, keyof T> & {
        [K in keyof T]: T[K] extends NodeProxy<infer U> ? NodeProxy<U> : never
} & {
        toVar(id?: string): StructNode<T>
        readonly __nodeType?: 'struct'
}

export interface StructFactory<T extends StructFields> {
        (initialValues?: StructFields, instanceId?: string): StructNode<T>
}

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

export type NodeProxy<T extends Constants = any> = T extends keyof ConstantsToType
        ? ConstantsToType[T]
        : NodeProxyImpl<T>

export type X<T extends Constants = any> = number | string | boolean | undefined | NodeProxy<T>

export interface BaseNodeProxy<T extends Constants> {
        // System properties
        readonly __nodeType?: T
        assign(x: any): NodeProxy<T>
        toVar(name?: string): NodeProxy<T>
        toString(c?: NodeContext): string
        type: NodeTypes
        props: NodeProps
        isProxy: true
        listeners: Set<(value: any) => void>

        // Element access for array/matrix types
        element<Index extends X>(index: Index): NodeProxy<InferArrayElement<T>>

        // Enhanced member access with type preservation
        member<K extends string>(
                key: K
        ): K extends keyof T ? (T[K] extends NodeProxy<infer U> ? NodeProxy<U> : never) : never

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

        /**
         * 3.1. unified logic with:
         * 1.1. index.ts functions and
         * 2.1. const.ts FUNCTION_RETURN_TYPES
         */
        // 0. Always return bool
        all(): Bool
        any(): Bool
        // 2. Always return float
        determinant(): Float
        distance<U extends Constants>(y: X<U>): Float
        dot<U extends Constants>(y: X<U>): Float
        length(): Float
        lengthSq(): Float
        luminance(): Float
        // 3. Always return vec3
        cross<U extends Constants>(y: X<U>): Vec3
        // 4. Always return vec4
        cubeTexture(...args: X[]): Vec4
        texture(...args: X[]): Vec4
        texelFetch(...args: X[]): Vec4
        textureLod(...args: X[]): Vec4

        /**
         * 3.1. unified with:
         * 1.1. index.ts functions and
         * 2.1. const.ts FUNCTIONS
         */
        // 0. Component-wise functions
        abs(): NodeProxy<T>
        acos(): NodeProxy<T>
        acosh(): NodeProxy<T>
        asin(): NodeProxy<T>
        asinh(): NodeProxy<T>
        atan(): NodeProxy<T>
        atanh(): NodeProxy<T>
        ceil(): NodeProxy<T>
        cos(): NodeProxy<T>
        cosh(): NodeProxy<T>
        degrees(): NodeProxy<T>
        dFdx(): NodeProxy<T>
        dFdy(): NodeProxy<T>
        exp(): NodeProxy<T>
        exp2(): NodeProxy<T>
        floor(): NodeProxy<T>
        fract(): NodeProxy<T>
        fwidth(): NodeProxy<T>
        inverseSqrt(): NodeProxy<T>
        log(): NodeProxy<T>
        log2(): NodeProxy<T>
        negate(): NodeProxy<T>
        normalize(): NodeProxy<T>
        oneMinus(): NodeProxy<T>
        radians(): NodeProxy<T>
        reciprocal(): NodeProxy<T>
        round(): NodeProxy<T>
        saturate(): NodeProxy<T>
        sign(): NodeProxy<T>
        sin(): NodeProxy<T>
        sinh(): NodeProxy<T>
        sqrt(): NodeProxy<T>
        tan(): NodeProxy<T>
        tanh(): NodeProxy<T>
        trunc(): NodeProxy<T>

        // 1. Functions where first argument determines return type
        atan2<U extends Constants>(x: X<U>): NodeProxy<T>
        clamp<U extends Constants, V>(mix: X<U>, max: V): NodeProxy<InferOperator<T, U>>
        max<U extends Constants>(y: X<U>): NodeProxy<InferOperator<T, U>>
        min<U extends Constants>(y: X<U>): NodeProxy<InferOperator<T, U>>
        mix<U extends Constants, V>(y: X<U>, a: V): NodeProxy<InferOperator<T, U>>
        pow<U extends Constants>(y: X<U>): NodeProxy<T>
        reflect<U extends Constants>(N: X<U>): NodeProxy<T>
        refract<U extends Constants>(N: X<U>, eta: any): NodeProxy<T>

        // 2. Functions where not first argument determines return type
        smoothstep<U extends Constants, V>(edge0: X<U>, edge1: V): NodeProxy<InferOperator<T, U>>
        step<U extends Constants>(edge: X<U>): NodeProxy<InferOperator<T, U>>
        // @NOTE: mod is operator
}
