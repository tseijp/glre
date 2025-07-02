import { is } from '../utils/helpers'
import {
        BOOL_RETURN_FUNCTIONS,
        BUILTIN_TYPES,
        COMPARISON_OPERATORS,
        COMPONENT_COUNT_TO_TYPE,
        CONSTANTS,
        FIRST_ARG_TYPE_FUNCTIONS,
        HIGHEST_TYPE_FUNCTIONS,
        LOGICAL_OPERATORS,
        PRESERVE_TYPE_FUNCTIONS,
        SCALAR_RETURN_FUNCTIONS,
        VEC3_RETURN_FUNCTIONS,
        VEC4_RETURN_FUNCTIONS,
} from './const'
import { isConstantsType, isNodeProxy } from './utils'
import type { Constants, NodeContext, NodeProxy, X } from './types'

const getHighestPriorityType = (args: X[], c: NodeContext) => {
        return args.reduce((highest, current) => {
                const currentType = infer(current, c)
                const highestPriority = CONSTANTS.indexOf(highest as any)
                const currentPriority = CONSTANTS.indexOf(currentType as any)
                return currentPriority > highestPriority ? currentType : highest
        }, 'float') as Constants
}

const inferBuiltin = (id: string | undefined): Constants => {
        return BUILTIN_TYPES[id as keyof typeof BUILTIN_TYPES]!
}

const inferFunction = (funcName: string, args: X[], c: NodeContext): Constants => {
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

const inferOperator = (leftType: string, rightType: string, op: string): Constants => {
        if (COMPARISON_OPERATORS.includes(op as any)) return 'bool'
        if (LOGICAL_OPERATORS.includes(op as any)) return 'bool'
        if (leftType === rightType) return leftType as Constants
        if (leftType.includes('vec') && !rightType.includes('vec')) return leftType as Constants
        if (rightType.includes('vec') && !leftType.includes('vec')) return rightType as Constants
        const leftPriority = CONSTANTS.indexOf(leftType as any)
        const rightPriority = CONSTANTS.indexOf(rightType as any)
        return (leftPriority >= rightPriority ? leftType : rightType) as Constants
}

export const inferPrimitiveType = (x: any): Constants => {
        if (is.bol(x)) return 'bool'
        if (is.num(x)) return 'float'
        if (is.arr(x)) return COMPONENT_COUNT_TO_TYPE[x.length as keyof typeof COMPONENT_COUNT_TO_TYPE] || 'float'
        return 'float'
}

const inferSwizzle = (count: number): Constants => {
        return COMPONENT_COUNT_TO_TYPE[count as keyof typeof COMPONENT_COUNT_TO_TYPE]!
}

const inferFromArray = (arr: X[], c: NodeContext): Constants => {
        if (arr.length === 0) return 'void'
        const ret = infer(arr[0], c)
        for (const x of arr.slice(1))
                if (ret !== infer(x)) throw new Error(`glre node system error: defined scope return mismatch`)
        return ret
}

export const inferImpl = (target: NodeProxy, c: NodeContext): Constants => {
        const { type, props } = target
        const { id, children = [], layout, inferFrom } = props
        const [x, y, z] = children
        if (type === 'conversion') return x as Constants
        if (type === 'operator') return inferOperator(infer(y, c), infer(z, c), x as string)
        if (type === 'function') return inferFunction(x as string, children.slice(1), c)
        if (type === 'swizzle') return inferSwizzle((x as string).length)
        if (type === 'ternary') return inferOperator(infer(y, c), infer(z, c), 'add')
        if (type === 'builtin') return inferBuiltin(id)
        if (type === 'define' && isConstantsType(layout?.type)) return layout?.type
        if (type === 'struct') return 'struct'
        if (type === 'dynamic') return infer(y, c)
        if (type === 'variable' && props.structNode) return 'struct'
        if (inferFrom) return inferFromArray(inferFrom, c)
        return infer(x, c)
}

export const infer = (target: X, c?: NodeContext | null): Constants => {
        if (!c) c = {}
        if (!isNodeProxy(target)) return inferPrimitiveType(target)
        if (!c.infers) c.infers = new WeakMap<NodeProxy, Constants>()
        if (c.infers.has(target)) return c.infers.get(target)!
        const ret = inferImpl(target, c)
        c.infers.set(target, ret)
        return ret
}
