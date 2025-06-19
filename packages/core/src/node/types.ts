import type { Swizzles } from './const'

export interface NodeState extends Record<Swizzles, NodeState> {
        add(n: X): NodeState
        sub(n: X): NodeState
        mul(n: X): NodeState
        div(n: X): NodeState
        mod(n: X): NodeState
        equal(n: X): NodeState
        notEqual(n: X): NodeState
        lessThan(n: X): NodeState
        lessThanEqual(n: X): NodeState
        greaterThan(n: X): NodeState
        greaterThanEqual(n: X): NodeState
        and(n: X): NodeState
        or(n: X): NodeState
        not(): NodeState
        assign(n: X): NodeState
        toVar(): NodeState
        toString(): string
        type: string
        props: NodeProps
}

export type X = NodeState | number | string | null | undefined

export type NodeTypes = 'operator' | 'function' | 'type' | 'uniform' | 'variable' | 'swizzle'

export interface NodeProps {
        id?: string
        children?: X[]
        defaultValue?: number | number[]
}
