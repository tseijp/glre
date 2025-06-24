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
import type { Constants, NodeConfig, X } from './types'

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

const getHighestPriorityType = (args: X[]) => {
        return args.reduce((highest, current) => {
                const currentType = infer(current)
                const highestPriority = CONSTANTS.indexOf(highest as any)
                const currentPriority = CONSTANTS.indexOf(currentType as any)
                return currentPriority > highestPriority ? currentType : highest
        }, 'float')
}
const inferSwizzleType = (count: number): Constants => {
        return COMPONENT_COUNT_TO_TYPE[count as keyof typeof COMPONENT_COUNT_TO_TYPE] || 'vec4'
}

const inferBuiltinType = (id: string | undefined): Constants => {
        if (!id) return 'vec3'
        return BUILTIN_TYPES[id as keyof typeof BUILTIN_TYPES]!
}

const inferMathType = (funcName: string, args: X[]): Constants => {
        const firstArgType = args.length > 0 ? infer(args[0]) : 'float'
        if (FIRST_ARG_TYPE_FUNCTIONS.includes(funcName as any)) return firstArgType as Constants
        if (SCALAR_RETURN_FUNCTIONS.includes(funcName as any)) return 'float'
        if (BOOL_RETURN_FUNCTIONS.includes(funcName as any)) return 'bool'
        if (PRESERVE_TYPE_FUNCTIONS.includes(funcName as any)) return firstArgType as Constants
        if (VEC3_RETURN_FUNCTIONS.includes(funcName as any)) return 'vec3'
        if (VEC4_RETURN_FUNCTIONS.includes(funcName as any)) return 'vec4'
        if (HIGHEST_TYPE_FUNCTIONS.includes(funcName as any)) return getHighestPriorityType(args) as Constants
        return firstArgType as Constants
}

export const infer = (target: X, c?: NodeConfig): Constants => {
        if (!target) throw ``
        if (!isNodeProxy(target)) return inferPrimitiveType(target)
        const { type, props } = target
        const { id, children = [], value, returnType } = props
        const [x, y, z] = children
        if (
                type === 'uniform' ||
                type === 'variable' ||
                type === 'constant' ||
                type === 'attribute' ||
                type === 'varying'
        )
                return inferPrimitiveType(value)
        if (type === 'conversion') return x as Constants
        if (type === 'operator') return inferBinaryOpType(infer(y, c), infer(z, c), x as string)
        if (type === 'function') return inferMathType(x as string, children.slice(1))
        if (type === 'swizzle') return inferSwizzleType((x as string).length)
        if (type === 'ternary') return inferBinaryOpType(infer(y, c), infer(z, c), 'add')
        if (type === 'define') return returnType!
        if (type === 'builtin') return inferBuiltinType(id)
        return 'float'
}

export const inferParameterTypes = (args: X[], c?: NodeConfig): Constants[] => {
        return args.map((arg) => infer(arg, c))
}
