import { FUNCTIONS, NODE_TYPES, OPERATOR_KEYS } from './const'

export type NodeType = (typeof NODE_TYPES)[number]

export type Functions = (typeof FUNCTIONS)[number]

export type Operators = (typeof OPERATOR_KEYS)[number]

export interface NodeProps {
        id?: string
        children?: X[]
        defaultValue?: number | number[] | boolean
        // 関数用プロパティ
        args?: number
        returnType?: string
        type?: string
}

export interface NodeConfig {
        isWebGL?: boolean
        uniforms?: Set<string>
        onUniform?: (name: string, value: any) => void
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
        | 'node_type'
        | 'math_fun'
        | 'declare'
        | 'assign'
        | 'fn'
        | 'fn_call'
        | 'if'
        | 'loop'
        | 'scope'
        | 'switch'
        | 'case'
        | 'default'
        | 'ternary'
        | 'texture'
        | 'attribute'
        | 'varying'
        | 'builtin'
        | 'constant'
        | 'vertex_stage'

export interface NodeProxy extends Record<Swizzles, NodeProxy> {
        // 基本演算子
        add(n: X): NodeProxy
        sub(n: X): NodeProxy
        mul(n: X): NodeProxy
        div(n: X): NodeProxy
        mod(n: X): NodeProxy

        // 比較演算子
        equal(n: X): NodeProxy
        notEqual(n: X): NodeProxy
        lessThan(n: X): NodeProxy
        lessThanEqual(n: X): NodeProxy
        greaterThan(n: X): NodeProxy
        greaterThanEqual(n: X): NodeProxy

        // 論理演算子
        and(n: X): NodeProxy
        or(n: X): NodeProxy
        not(): NodeProxy

        // 変数操作
        assign(n: X): NodeProxy
        toVar(name?: string): NodeProxy
        toConst(name?: string): NodeProxy

        // 数学関数メソッド
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

        // 型変換メソッド
        toFloat(): NodeProxy
        toInt(): NodeProxy
        toUint(): NodeProxy
        toBool(): NodeProxy
        toVec2(): NodeProxy
        toVec3(): NodeProxy
        toVec4(): NodeProxy
        toIvec2(): NodeProxy
        toIvec3(): NodeProxy
        toIvec4(): NodeProxy
        toUvec2(): NodeProxy
        toUvec3(): NodeProxy
        toUvec4(): NodeProxy
        toBvec2(): NodeProxy
        toBvec3(): NodeProxy
        toBvec4(): NodeProxy
        toMat2(): NodeProxy
        toMat3(): NodeProxy
        toMat4(): NodeProxy
        toColor(): NodeProxy

        // システムプロパティ
        toString(c?: NodeConfig): string
        type: NodeTypes
        props: NodeProps
        isProxy: true
}

export type X = NodeProxy | number | string | boolean | null | undefined
