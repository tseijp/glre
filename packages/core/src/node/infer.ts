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
import { isConstants, isNodeProxy, isSwizzle } from './utils'
import type { Constants, NodeContext, NodeProxy, X } from './types'

const getHighestPriorityType = <T extends Constants>(args: X<T>[], c: NodeContext): T => {
        return args.reduce((highest, current) => {
                const currentType = infer(current, c)
                const highestPriority = CONSTANTS.indexOf(highest as any)
                const currentPriority = CONSTANTS.indexOf(currentType as any)
                return currentPriority > highestPriority ? currentType : highest
        }, 'float') as T
}

const inferBuiltin = <T extends Constants>(id: string | undefined): T => {
        return BUILTIN_TYPES[id as keyof typeof BUILTIN_TYPES] as T
}

const inferFunction = <T extends Constants>(funcName: string, args: X<T>[], c: NodeContext): T => {
        const firstArgType = args.length > 0 ? infer(args[0], c) : 'float'
        if (FIRST_ARG_TYPE_FUNCTIONS.includes(funcName as any)) return firstArgType as T
        if (SCALAR_RETURN_FUNCTIONS.includes(funcName as any)) return 'float' as T
        if (BOOL_RETURN_FUNCTIONS.includes(funcName as any)) return 'bool' as T
        if (PRESERVE_TYPE_FUNCTIONS.includes(funcName as any)) return firstArgType as T
        if (VEC3_RETURN_FUNCTIONS.includes(funcName as any)) return 'vec3' as T
        if (VEC4_RETURN_FUNCTIONS.includes(funcName as any)) return 'vec4' as T
        if (HIGHEST_TYPE_FUNCTIONS.includes(funcName as any)) return getHighestPriorityType(args, c)
        return firstArgType as T
}

const inferOperator = <T extends Constants>(leftType: string, rightType: string, op: string): T => {
        if (COMPARISON_OPERATORS.includes(op as any)) return 'bool' as T
        if (LOGICAL_OPERATORS.includes(op as any)) return 'bool' as T
        if (leftType === rightType) return leftType as T
        if (leftType.includes('vec') && !rightType.includes('vec')) return leftType as T
        if (rightType.includes('vec') && !leftType.includes('vec')) return rightType as T
        const leftPriority = CONSTANTS.indexOf(leftType as any)
        const rightPriority = CONSTANTS.indexOf(rightType as any)
        return (leftPriority >= rightPriority ? leftType : rightType) as T
}

export const inferPrimitiveType = (x: any): Constants => {
        if (is.bol(x)) return 'bool'
        if (is.str(x)) return 'texture'
        if (is.num(x)) return Number.isInteger(x) ? 'int' : 'float'
        if (is.arr(x)) return COMPONENT_COUNT_TO_TYPE[x.length as keyof typeof COMPONENT_COUNT_TO_TYPE] || 'float'
        return 'float'
}

const inferFromCount = (count: number): Constants => {
        return COMPONENT_COUNT_TO_TYPE[count as keyof typeof COMPONENT_COUNT_TO_TYPE]!
}

const inferFromArray = <T extends Constants>(arr: X<T>[], c: NodeContext): Constants => {
        if (arr.length === 0) return 'void'
        const [x] = arr
        if (is.str(x)) return x as Constants // for struct
        const ret = infer(x, c)
        for (const x of arr.slice(1))
                if (ret !== infer(x, c)) throw new Error(`glre node system error: defined scope return mismatch`)
        return ret
}

export const inferImpl = <T extends Constants>(target: NodeProxy<T>, c: NodeContext): T => {
        const { type, props } = target
        const { id, children = [], layout, inferFrom } = props
        const [x, y, z] = children
        if (type === 'conversion') return x as T
        if (type === 'operator') return inferOperator(infer(y, c), infer(z, c), x as string)
        if (type === 'function') return inferFunction(x as string, children.slice(1), c)
        if (type === 'ternary') return inferOperator(infer(y, c), infer(z, c), 'add')
        if (type === 'builtin') return inferBuiltin(id)
        if (type === 'define' && isConstants(layout?.type)) return layout?.type as T
        if (type === 'attribute' && is.arr(x) && c.gl?.count) return inferFromCount(x.length / c.gl.count)
        if (type === 'member') {
                if (isSwizzle(x)) return inferFromCount(x.length)
                if (isNodeProxy(y) && is.str(x)) {
                        const field = y.props.fields?.[x] // for variable node of struct member
                        if (field) return infer(field, c)
                }
                return 'float' // fallback @TODO FIX
        }
        if (inferFrom) return inferFromArray(inferFrom, c)
        return infer(x, c)
}

export const infer = <T extends Constants>(target: X<T>, c?: NodeContext | null): T => {
        if (!c) c = {}
        if (!isNodeProxy(target)) return inferPrimitiveType(target) as T
        if (is.arr(target)) return inferFromCount(target.length) as T
        if (!c.infers) c.infers = new WeakMap<NodeProxy, Constants>()
        if (c.infers.has(target)) return c.infers.get(target) as T
        const ret = inferImpl(target, c)
        c.infers.set(target, ret)
        return ret as T
}
