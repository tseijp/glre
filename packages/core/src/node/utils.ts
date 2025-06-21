import { is } from '../utils/helpers'
import type { NodeState, X } from './types'

export const joins = (children: X[], state: NodeState) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => shader(x, state))
                .join(', ')
}

export const inferType = (node: X, state: NodeState): string => {
        if (!node || typeof node !== 'object') return 'float'

        const type = node.type
        const { children = [] } = node.props

        if (type === 'node_type') {
                return children[0] as string
        }

        if (type === 'operator') {
                const [, left, right] = children
                const leftType = inferType(left, state)
                const rightType = inferType(right, state)

                if (leftType === rightType) return leftType
                if (leftType.includes('vec') || rightType.includes('vec')) {
                        return leftType.includes('vec') ? leftType : rightType
                }
                return 'float'
        }

        if (type === 'function') {
                const funcName = children[0] as string
                if (['normalize', 'cross', 'reflect'].includes(funcName)) {
                        return inferType(children[1], state)
                }
                if (['dot', 'distance', 'length'].includes(funcName)) {
                        return 'float'
                }
                return 'float'
        }

        return 'float'
}

// Forward declaration to avoid circular import
const shader = (x: X, state?: NodeState | null): string => {
        // This will be imported from code.ts at runtime
        const { shader: shaderFn } = require('./code')
        return shaderFn(x, state)
}
