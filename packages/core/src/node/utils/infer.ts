import { isConstants, isX, isSwizzle } from './utils'
import {
        BUILTIN_TYPES,
        COMPONENT_COUNT_TO_TYPE,
        FUNCTION_RETURN_TYPES,
        getOperatorResultType,
        validateOperatorTypes,
} from './const'
import { is } from '../../utils/helpers'
import type { Constants as C, NodeContext, X, Y } from '../types'

const inferBuiltin = <T extends C>(id: string | undefined) => {
        return BUILTIN_TYPES[id as keyof typeof BUILTIN_TYPES] as T
}

const inferOperator = <T extends C>(L: T, R: T, op: string): T => {
        if (!validateOperatorTypes(L, R, op))
                console.warn(`GLRE Type Warning: Invalid operator '${op}' between types '${L}' and '${R}'`)
        return getOperatorResultType(L, R, op) as T
}

export const inferPrimitiveType = <T extends C>(x: Y<T>) => {
        if (is.bol(x)) return 'bool' as T
        if (is.str(x)) return 'texture' as T
        if (is.num(x)) return 'float' as T // @TODO FIX:  Number.isInteger(x) ? 'int' : 'float'
        if (is.arr(x)) return COMPONENT_COUNT_TO_TYPE[x.length as keyof typeof COMPONENT_COUNT_TO_TYPE] as T
        return 'float' as T
}

const inferFromCount = <T extends C>(count: number) => {
        return COMPONENT_COUNT_TO_TYPE[count as keyof typeof COMPONENT_COUNT_TO_TYPE] as T
}

const inferFromArray = <T extends C>(arr: Y<T>[], c: NodeContext) => {
        if (arr.length === 0) return 'void' as T
        const [x] = arr
        if (is.str(x)) return x as T // for struct
        const ret = infer(x, c)
        // for (const x of arr.slice(1))
        //         if (ret !== infer(x, c)) throw new Error(`glre node system error: defined scope return mismatch`)
        return ret
}

export const inferFunction = <T extends C>(x: Y) => {
        return FUNCTION_RETURN_TYPES[x as keyof typeof FUNCTION_RETURN_TYPES] as T
}

export const inferImpl = <T extends C>(target: X<T>, c: NodeContext): T => {
        const { type, props } = target
        const { id, children = [], inferFrom, layout } = props
        const [x, y, z] = children
        if (type === 'conversion') return x
        if (type === 'operator') return inferOperator(infer(y, c), infer(z, c), x)
        if (type === 'builtin') return inferBuiltin(id)
        if (type === 'function') return inferFunction(x) || infer(y, c)
        if (type === 'define') {
                if (isConstants(layout?.type)) return layout?.type as T
                if (!inferFrom || inferFrom.length === 0) return 'void' as T
                return inferFromArray(inferFrom, c)
        }
        if (type === 'attribute' && is.arr(x) && c.gl?.count) return inferFromCount(x.length / c.gl.count)
        if (type === 'member') {
                if (isSwizzle(y)) return inferFromCount(y.length)
                if (isX(x)) {
                        const structType = infer(x, c)
                        const fields = c.code?.structStructFields?.get(structType)
                        if (fields && fields[y]) return infer(fields[y], c) as T
                }
                return 'float' as T
        }
        if (inferFrom) return inferFromArray(inferFrom, c)
        return x ? infer(x, c) : ('void' as T) // for uniform and storage gather and scatter
}

export const infer = <T extends C>(target: Y<T>, c?: NodeContext | null): T => {
        if (!c) c = {}
        if (!isX(target)) return inferPrimitiveType(target)
        if (is.arr(target)) return inferFromCount(target.length)
        if (!c.infers) c.infers = new WeakMap<X<T>, C>()
        if (c.infers.has(target)) return c.infers.get(target) as T
        const ret = inferImpl(target, c)
        c.infers.set(target, ret)
        return ret as T
}
