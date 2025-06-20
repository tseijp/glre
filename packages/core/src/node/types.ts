import { is } from '../utils/helpers'
import { FUNCTIONS, NODE_TYPES, OPERATOR_KEYS } from './const'

export type NodeTypes = 'uniform' | 'variable' | 'swizzle' | 'operator' | 'node_type' | 'function'

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
        toVar(): NodeProxy
        toString(): string
        type: string
        props: NodeProps
}

export type X = NodeProxy | number | string | null | undefined

export interface NodeProps {
        id?: string
        children?: X[]
        defaultValue?: number | number[]
}

export interface NodeState {
        lines?: string[]
        isWebGL?: boolean
}

type _AllSwizzles<T extends string> = T | `${T}${T}` | `${T}${T}${T}` | `${T}${T}${T}${T}`

export type Swizzles =
        | _AllSwizzles<'x' | 'y' | 'z' | 'w'>
        | _AllSwizzles<'r' | 'g' | 'b' | 'a'>
        | _AllSwizzles<'p' | 'q'>
        | _AllSwizzles<'s' | 't'>

export type NodeType = (typeof NODE_TYPES)[number]

export type Functions = (typeof FUNCTIONS)[number]

export type Operators = (typeof OPERATOR_KEYS)[number]

// utils
export const isSwizzle = (key: unknown): key is Swizzles => {
        return is.str(key) && /^[xyzwrgbastpq]{1,4}$/.test(key)
}

export const isOperator = (key: unknown): key is Operators => {
        return OPERATOR_KEYS.includes(key as Operators)
}

export const isNodeType = (key: unknown): key is NodeType => {
        return NODE_TYPES.includes(key as NodeType)
}

export const isFunction = (key: unknown): key is Functions => {
        return FUNCTIONS.includes(key as Functions)
}
