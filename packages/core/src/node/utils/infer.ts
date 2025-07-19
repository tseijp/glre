import { isConstants, isNodeProxy, isSwizzle } from './utils'
import {
        BUILTIN_TYPES,
        COMPARISON_OPERATORS,
        COMPONENT_COUNT_TO_TYPE,
        FUNCTION_RETURN_TYPES,
        LOGICAL_OPERATORS,
} from './const'
import { is } from '../../utils/helpers'
import type { Constants as C, NodeContext, NodeProxy, X } from '../types'

const inferBuiltin = <T extends C>(id: string | undefined) => {
        return BUILTIN_TYPES[id as keyof typeof BUILTIN_TYPES] as T
}

// Unified logic with types.ts InferOperator type
const inferOperator = <T extends C>(L: T, R: T, op: string): T => {
        if (COMPARISON_OPERATORS.includes(op as any) || LOGICAL_OPERATORS.includes(op as any)) return 'bool' as T
        if (L === R) return L
        // broadcast
        if (L === 'float' || L === 'int') return R
        if (R === 'float' || R === 'int') return L
        // mat * vec → vec
        if (L === 'mat4' && R === 'vec4') return R
        if (L === 'mat3' && R === 'vec3') return R
        if (L === 'mat2' && R === 'vec2') return R
        // vec * mat → vec
        if (L === 'vec4' && R === 'mat4') return L
        if (L === 'vec3' && R === 'mat3') return L
        if (L === 'vec2' && R === 'mat2') return L
        return L
}

// Unified logic with infer.ts InferArrayElement type
const inferArrayElement = <T extends C>(arrayType: T): T => {
        if (arrayType === 'mat4') return 'vec4' as T
        if (arrayType === 'mat3') return 'vec3' as T
        if (arrayType === 'mat2') return 'vec2' as T
        return 'float' as T
}

export const inferPrimitiveType = <T extends C>(x: X) => {
        if (is.bol(x)) return 'bool' as T
        if (is.str(x)) return 'texture' as T
        if (is.num(x)) return 'float' as T // @TODO FIX:  Number.isInteger(x) ? 'int' : 'float'
        if (is.arr(x)) return COMPONENT_COUNT_TO_TYPE[x.length as keyof typeof COMPONENT_COUNT_TO_TYPE] as T
        return 'float' as T
}

const inferFromCount = <T extends C>(count: number) => {
        return COMPONENT_COUNT_TO_TYPE[count as keyof typeof COMPONENT_COUNT_TO_TYPE] as T
}

const inferFromArray = <T extends C>(arr: X<T>[], c: NodeContext) => {
        if (arr.length === 0) return 'void' as T
        const [x] = arr
        if (is.str(x)) return x as T // for struct
        const ret = infer(x, c)
        for (const x of arr.slice(1))
                if (ret !== infer(x, c)) throw new Error(`glre node system error: defined scope return mismatch`)
        return ret
}

export const inferFunction = <T extends C>(x: X) => {
        return FUNCTION_RETURN_TYPES[x as keyof typeof FUNCTION_RETURN_TYPES] as T
}

export const inferImpl = <T extends C>(target: NodeProxy<T>, c: NodeContext): T => {
        const { type, props } = target
        const { id, children = [], inferFrom, layout } = props
        const [x, y, z] = children
        if (type === 'conversion') return x
        if (type === 'operator') return inferOperator(infer(y, c), infer(z, c), x)
        if (type === 'ternary') return inferOperator(infer(y, c), infer(z, c), 'add')
        if (type === 'builtin') return inferBuiltin(id)
        if (type === 'function') return inferFunction(x) || infer(y, c)
        if (type === 'define' && isConstants(layout?.type)) return layout?.type as T
        if (type === 'attribute' && is.arr(x) && c.gl?.count) return inferFromCount(x.length / c.gl.count)
        if (type === 'element') return inferArrayElement(infer(x, c) as T)
        if (type === 'member') {
                if (isSwizzle(y)) return inferFromCount(y.length)
                if (isNodeProxy(x)) {
                        const field = (x as any).props.fields[y] // for variable node of struct member
                        if (field) return infer(field, c)
                }
                return 'float' as T // fallback @TODO FIX
        }
        if (inferFrom) return inferFromArray(inferFrom, c)
        return infer(x, c) // for uniform
}

export const infer = <T extends C>(target: X<T>, c?: NodeContext | null): T => {
        if (!c) c = {}
        if (!isNodeProxy(target)) return inferPrimitiveType(target)
        if (is.arr(target)) return inferFromCount(target.length)
        if (!c.infers) c.infers = new WeakMap<NodeProxy<T>, C>()
        if (c.infers.has(target)) return c.infers.get(target) as T
        const ret = inferImpl(target, c)
        c.infers.set(target, ret)
        return ret
}
