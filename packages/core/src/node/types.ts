import { CONSTANTS, CONVERSIONS, FUNCTIONS, OPERATOR_KEYS, OPERATOR_TYPE_RULES } from './utils/const'
import type { GL } from '../types'

export type Constants = (typeof CONSTANTS)[number] | 'void'
export type Conversions = (typeof CONVERSIONS)[number]
export type Functions = (typeof FUNCTIONS)[number]
export type Operators = (typeof OPERATOR_KEYS)[number]

/**
 * scope
 */
export interface FnLayout {
        name: string
        type: C | 'auto'
        inputs?: Array<{
                name: string
                type: C
        }>
}

export interface FnType<T extends X | Struct | void, Args extends any[]> {
        (...args: Args): T extends void ? Void : T
        setLayout(layout: FnLayout): FnType<T, Args>
}

export type StructFields = Record<string, X>

export interface StructFactory<T extends StructFields> {
        (initialValues?: StructFields, instanceId?: string): Struct<T>
}

/**
 * node
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
        infers?: WeakMap<X, C>
        onMount?: (name: string) => void
        code?: {
                headers: Map<string, string>
                fragInputs: Map<string, string>
                vertInputs: Map<string, string>
                vertOutputs: Map<string, string>
                vertVaryings: Map<string, string>
                computeInputs: Map<string, string>
                dependencies: Map<string, Set<string>>
                structStructFields: Map<string, StructFields>
        }
}

/**
 * infer
 */
// Optimized string length using direct pattern matching
// prettier-ignore
type _StringLength<A extends string> =
        A extends `${infer _}${infer A}` ? A extends '' ? 1 :
        A extends `${infer _}${infer B}` ? B extends '' ? 2 :
        B extends `${infer _}${infer C}` ? C extends '' ? 3 :
        4 : never : never : never

// Unified logic with infer.ts inferOperator function
// prettier-ignore
type InferOperator<L extends C, R extends C> =
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
type InferArrayElement<T extends C> =
        T extends 'mat4' ? 'vec4' :
        T extends 'mat3' ? 'vec3' :
        T extends 'mat2' ? 'vec2' :
        'float'

type ExtractPairs<T> = T extends readonly [infer L, infer R, string] ? [L, R] | [R, L] : never
type OperatorTypeRules = ExtractPairs<(typeof OPERATOR_TYPE_RULES)[number]>
type IsInRules<L extends C, R extends C> = [L, R] extends OperatorTypeRules ? 1 : 0
type ValidateOperator<L extends C, R extends C> = L extends R ? 1 : IsInRules<L, R>

// prettier-ignore
type InferSwizzleType<S extends string> =
        _StringLength<S> extends 4 ? 'vec4' :
        _StringLength<S> extends 3 ? 'vec3' :
        _StringLength<S> extends 2 ? 'vec2' :
        'float'

/**
 * Swizzles
 */
type _Swizzles<T extends string> = T | `${T}${T}` | `${T}${T}${T}` | `${T}${T}${T}${T}`

export type Swizzles =
        | _Swizzles<'x' | 'y' | 'z' | 'w'>
        | _Swizzles<'r' | 'g' | 'b' | 'a'>
        | _Swizzles<'p' | 'q'>
        | _Swizzles<'s' | 't'>

export type Void = XImpl<'void'>
export type Bool = XImpl<'bool'>
export type UInt = XImpl<'uint'>
export type Int = XImpl<'int'>
export type Float = XImpl<'float'>
export type BVec2 = XImpl<'bvec2'>
export type IVec2 = XImpl<'ivec2'>
export type UVec2 = XImpl<'uvec2'>
export type Vec2 = XImpl<'vec2'>
export type BVec3 = XImpl<'bvec3'>
export type IVec3 = XImpl<'ivec3'>
export type UVec3 = XImpl<'uvec3'>
export type Vec3 = XImpl<'vec3'>
export type BVec4 = XImpl<'bvec4'>
export type IVec4 = XImpl<'ivec4'>
export type UVec4 = XImpl<'uvec4'>
export type Vec4 = XImpl<'vec4'>
export type Color = XImpl<'color'>
export type Mat2 = XImpl<'mat2'>
export type Mat3 = XImpl<'mat3'>
export type Mat4 = XImpl<'mat4'>
export type Texture = XImpl<'texture'>
export type Sampler2D = XImpl<'sampler2D'>
export type StructBase = XImpl<'struct'>
export type Struct<T extends StructFields = any> = Omit<StructBase, keyof T> & {
        [K in keyof T]: T[K] extends X<infer U> ? X<U> : never
} & {
        toVar(id?: string): Struct<T>
}

export interface ConstantsToType {
        void: Void
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
        struct: StructBase
}

/**
 * X and Y
 */
type XImpl<T extends C> = _X<T> & {
        [K in string as K extends Methods ? never : K]: any
} & {
        [K in Swizzles]: X<InferSwizzleType<K>>
}

type C = Constants

export type X<T extends C = C> = T extends keyof ConstantsToType ? ConstantsToType[T] : _X<T>
export type Y<T extends C = C> = number | number[] | string | boolean | undefined | X<T>

type Methods =
        | Functions
        | Operators
        | Conversions
        | Swizzles
        // system property
        | '__nodeType'
        | 'type'
        | 'props'
        | 'isProxy'
        | 'assign'
        | 'toVar'
        | 'toString'
        | 'element'

interface _X<T extends C> {
        // System properties
        readonly __nodeType?: T
        assign(x: any): X<T>
        toVar(name?: string): X<T>
        toString(c?: NodeContext): string
        type: NodeTypes
        props: NodeProps
        isProxy: true
        listeners: Set<(value: any) => void>

        // Element access for array/matrix types
        element<Index extends X>(index: Index): X<InferArrayElement<T>>

        // Enhanced member access with type preservation
        member<K extends string>(key: K): K extends keyof T ? (T[K] extends X<infer U> ? X<U> : never) : never

        // Operators methods with unified type validation
        add<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): X<InferOperator<T, U>>
        sub<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): X<InferOperator<T, U>>
        mul<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): X<InferOperator<T, U>>
        div<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): X<InferOperator<T, U>>
        mod<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): X<InferOperator<T, U>>
        equal<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): Bool
        notEqual<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): Bool
        lessThan<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): Bool
        lessThanEqual<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): Bool
        greaterThan<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): Bool
        greaterThanEqual<U extends C>(x: ValidateOperator<T, U> extends 0 ? never : number | X<U>): Bool
        and(x: Bool): Bool
        or(x: Bool): Bool
        not(): Bool

        // Bitwise operators
        bitAnd(x: X<T>): X<T>
        bitOr(x: X<T>): X<T>
        bitXor(x: X<T>): X<T>
        bitNot(): X<T>
        shiftLeft<U extends C>(x: X<U>): X<InferOperator<T, U>>
        shiftRight<U extends C>(x: X<U>): X<InferOperator<T, U>>

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

        // 2. WGSL-compliant return types with individual function constraints
        determinant(): T extends 'mat2' | 'mat3' | 'mat4' ? Float : never
        distance<U extends C>(
                y: T extends 'vec2' | 'vec3' | 'vec4' ? (U extends T ? number | X<U> : never) : never
        ): Float
        dot<U extends C>(
                y: T extends 'vec2' | 'vec3' | 'vec4' | 'ivec2' | 'ivec3' | 'ivec4'
                        ? U extends T
                                ? number | X<U>
                                : never
                        : never
        ): T extends `ivec${string}` ? Int : Float
        length(): T extends 'vec2' | 'vec3' | 'vec4' ? Float : never
        lengthSq(): Float
        luminance(): Float

        // 3. Always return vec3 with vector constraint
        cross<U extends C = 'vec3'>(y: T extends 'vec3' ? (U extends 'vec3' ? number | X<U> : never) : never): Vec3

        // 4. Always return vec4
        cubeTexture(...args: X[]): Vec4
        texture(...args: X[]): Vec4
        texelFetch(...args: X[]): Vec4
        textureLod(...args: X[]): Vec4

        /**
         * 3.2. unified with:
         * 1.2. index.ts functions and
         * 2.2. const.ts FUNCTIONS
         */
        // 0. Component-wise functions with type validation
        abs(): X<T>
        acos(): X<T>
        acosh(): X<T>
        asin(): X<T>
        asinh(): X<T>
        atan(): X<T>
        atanh(): X<T>
        ceil(): X<T>
        cos(): X<T>
        cosh(): X<T>
        degrees(): X<T>
        dFdx(): X<T>
        dFdy(): X<T>
        exp(): X<T>
        exp2(): X<T>
        floor(): X<T>
        fract(): X<T>
        fwidth(): X<T>
        inverseSqrt(): X<T>
        log(): X<T>
        log2(): X<T>
        negate(): X<T>
        normalize(): T extends 'vec2' | 'vec3' | 'vec4' ? X<T> : never
        oneMinus(): X<T>
        radians(): X<T>
        reciprocal(): X<T>
        round(): X<T>
        saturate(): X<T>
        sign(): X<T>
        sin(): X<T>
        sinh(): X<T>
        sqrt(): X<T>
        tan(): X<T>
        tanh(): X<T>
        trunc(): X<T>

        // 1. Functions where first argument determines return type with unified parameter types
        atan2<U extends C>(x: number | X<U>): X<T>
        clamp<U extends C>(min: number | X<U>, max: number | X<U>): X<InferOperator<T, U>>
        max<U extends C>(y: number | X<U>): X<InferOperator<T, U>>
        min<U extends C>(y: number | X<U>): X<InferOperator<T, U>>
        mix<U extends C>(y: number | X<U>, a: number): X<InferOperator<T, U>>
        pow<U extends C>(y: number | X<U>): X<T>
        reflect<U extends C>(
                N: T extends 'vec2' | 'vec3' | 'vec4' ? (U extends T ? number | X<U> : never) : never
        ): X<T>
        refract<U extends C>(
                N: T extends 'vec2' | 'vec3' | 'vec4' ? (U extends T ? number | X<U> : never) : never,
                eta: number
        ): T extends 'vec2' | 'vec3' | 'vec4' ? X<T> : never

        // 2. Functions where not first argument determines return type with unified parameter types
        smoothstep<U extends C>(edge0: number | X<U>, edge1: number | X<U>): X<InferOperator<T, U>>
        step<U extends C>(edge: number | X<U>): X<InferOperator<T, U>>
        // @NOTE: mod is operator
}
