import { is } from '../utils/helpers'
import { isNodeProxy } from './utils'
import {
        CONSTANTS,
        SCALAR_RETURN_FUNCTIONS,
        BOOL_RETURN_FUNCTIONS,
        PRESERVE_TYPE_FUNCTIONS,
        VEC3_RETURN_FUNCTIONS,
        FIRST_ARG_TYPE_FUNCTIONS,
        HIGHEST_TYPE_FUNCTIONS,
        VEC4_RETURN_FUNCTIONS,
        COMPARISON_OPERATORS,
        LOGICAL_OPERATORS,
        COMPONENT_COUNT_TO_TYPE,
        BUILTIN_TYPES,
} from './const'
import type { Constants, NodeConfig, NodeProxy, X } from './types'

const inferPrimitiveType = (x: any): Constants => {
        if (is.bol(x)) return 'bool'
        if (is.num(x)) return 'float' // Number.isInteger(x) ? 'int' : 'float' // @TODO FIX
        if (is.arr(x)) return COMPONENT_COUNT_TO_TYPE[x.length as keyof typeof COMPONENT_COUNT_TO_TYPE] || 'float'
        return 'float'
}

const inferBinaryOpType = (leftType: string, rightType: string, op: string): Constants => {
        if (COMPARISON_OPERATORS.includes(op as any)) return 'bool'
        if (LOGICAL_OPERATORS.includes(op as any)) return 'bool'
        if (leftType === rightType) return leftType as Constants
        if (leftType.includes('vec') && !rightType.includes('vec')) return leftType as Constants
        if (rightType.includes('vec') && !leftType.includes('vec')) return rightType as Constants
        const leftPriority = CONSTANTS.indexOf(leftType as any)
        const rightPriority = CONSTANTS.indexOf(rightType as any)
        return (leftPriority >= rightPriority ? leftType : rightType) as Constants
}

const getHighestPriorityType = (args: X[], c: NodeConfig) => {
        return args.reduce((highest, current) => {
                const currentType = infer(current, c)
                const highestPriority = CONSTANTS.indexOf(highest as any)
                const currentPriority = CONSTANTS.indexOf(currentType as any)
                return currentPriority > highestPriority ? currentType : highest
        }, 'float') as Constants
}

const inferSwizzleType = (count: number): Constants => {
        return COMPONENT_COUNT_TO_TYPE[count as keyof typeof COMPONENT_COUNT_TO_TYPE]!
}

const inferBuiltinType = (id: string | undefined): Constants => {
        return BUILTIN_TYPES[id as keyof typeof BUILTIN_TYPES]!
}

const inferMathType = (funcName: string, args: X[], c: NodeConfig): Constants => {
        const firstArgType = args.length > 0 ? infer(args[0], c) : 'float'
        if (FIRST_ARG_TYPE_FUNCTIONS.includes(funcName as any)) return firstArgType
        if (SCALAR_RETURN_FUNCTIONS.includes(funcName as any)) return 'float'
        if (BOOL_RETURN_FUNCTIONS.includes(funcName as any)) return 'bool'
        if (PRESERVE_TYPE_FUNCTIONS.includes(funcName as any)) return firstArgType
        if (VEC3_RETURN_FUNCTIONS.includes(funcName as any)) return 'vec3'
        if (VEC4_RETURN_FUNCTIONS.includes(funcName as any)) return 'vec4'
        if (HIGHEST_TYPE_FUNCTIONS.includes(funcName as any)) return getHighestPriorityType(args, c)
        return firstArgType
}

export const inferImpl = (target: NodeProxy, c: NodeConfig): Constants => {
        const { type, props } = target
        const { id, children = [], value, inferFrom } = props
        const [x, y, z] = children
        if (inferFrom) return infer(inferFrom, c)
        if (
                type === 'uniform' ||
                type === 'constant' ||
                type === 'attribute' ||
                type === 'variable' ||
                type === 'varying'
        )
                return inferPrimitiveType(value)
        if (type === 'conversion') return x as Constants
        if (type === 'operator') return inferBinaryOpType(infer(y, c), infer(z, c), x as string)
        if (type === 'function') return inferMathType(x as string, children.slice(1), c)
        if (type === 'swizzle') return inferSwizzleType((x as string).length)
        if (type === 'ternary') return inferBinaryOpType(infer(y, c), infer(z, c), 'add')
        if (type === 'define') return y ? infer(y, c) : 'void'
        if (type === 'builtin') return inferBuiltinType(id)
        return 'float'
}

export const infer = (target: X, c: NodeConfig | null): Constants => {
        if (!c) c = {}
        if (!isNodeProxy(target)) return inferPrimitiveType(target)
        if (!c.infers) c.infers = new WeakMap<NodeProxy, Constants>()
        if (c.infers.has(target)) return c.infers.get(target)!
        const ret = inferImpl(target, c)
        c.infers.set(target, ret)
        return ret
}
