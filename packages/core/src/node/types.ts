import { FUNCTIONS, NODE_TYPES, OPERATOR_KEYS } from './const'

export type NodeType = (typeof NODE_TYPES)[number]

export type Functions = (typeof FUNCTIONS)[number]

export type Operators = (typeof OPERATOR_KEYS)[number]

export interface NodeProps {
        id?: string
        children?: X[]
        defaultValue?: number | number[]
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
        | 'fragment'
        | 'vertex'
        | 'declare'
        | 'assign'
        | 'fn'
        | 'if'
        | 'loop'
        | 'scope'

export interface NodeProxy extends Record<Swizzles, NodeProxy> {
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
        assign(n: X): NodeProxy
        toVar(name?: string): NodeProxy
        toString(c?: NodeConfig): string
        type: NodeTypes
        props: NodeProps
        isProxy: true
}

export type X = NodeProxy | number | string | null | undefined
