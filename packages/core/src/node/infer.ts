import { is } from '../utils/helpers'
import { BUILTIN_TYPES, COMPARISON_OPERATORS, COMPONENT_COUNT_TO_TYPE, CONSTANTS, LOGICAL_OPERATORS } from './const'
import { isConstants, isNodeProxy, isSwizzle } from './utils'
import type { Constants as C, NodeContext, NodeProxy, X } from './types'

const inferBuiltin = <T extends C>(id: string | undefined) => {
        return BUILTIN_TYPES[id as keyof typeof BUILTIN_TYPES] as T
}

const inferOperator = <T extends C>(L: string, R: string, op: string): T => {
        if (COMPARISON_OPERATORS.includes(op as any) || LOGICAL_OPERATORS.includes(op as any)) return 'bool' as T
        if (L === R) return L as T
        if (L.includes('vec') || R.includes('vec')) return (L.includes('vec') ? L : R) as T
        if (L.includes('mat') || R.includes('mat')) return (L.includes('mat') ? L : R) as T
        return (L === 'float' ? L : R) as T
}

export const inferPrimitiveType = (x: X): C => {
        if (is.bol(x)) return 'bool'
        if (is.str(x)) return 'texture'
        if (is.num(x)) return Number.isInteger(x) ? 'int' : 'float'
        if (is.arr(x)) return COMPONENT_COUNT_TO_TYPE[x.length as keyof typeof COMPONENT_COUNT_TO_TYPE] || 'float'
        return 'float'
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

export const inferImpl = <T extends C>(target: NodeProxy<T>, c: NodeContext): T => {
        const { type, props } = target
        const { id, children = [], inferFrom, layout } = props
        const [x, y, z] = children
        if (type === 'conversion') return x
        if (type === 'operator') return inferOperator(infer(y, c), infer(z, c), x as string)
        if (type === 'ternary') return inferOperator(infer(y, c), infer(z, c), 'add')
        if (type === 'builtin') return inferBuiltin(id)
        if (type === 'function' && inferFrom) return inferFromArray(inferFrom, c)
        if (type === 'define' && isConstants(layout?.type)) return layout?.type as T
        if (type === 'attribute' && is.arr(x) && c.gl?.count) return inferFromCount(x.length / c.gl.count)
        if (type === 'member') {
                if (isSwizzle(x)) return inferFromCount(x.length)
                if (isNodeProxy(y) && is.str(x)) {
                        const field = (y as any).props.fields?.[x] // for variable node of struct member
                        if (field) return infer(field, c)
                }
                return 'float' as T // fallback @TODO FIX
        }
        if (inferFrom) return inferFromArray(inferFrom, c)
        return infer(x, c) // for uniform
}

export const infer = <T extends C>(target: X<T>, c?: NodeContext | null): T => {
        if (!c) c = {}
        if (!isNodeProxy(target)) return inferPrimitiveType(target) as T
        if (is.arr(target)) return inferFromCount(target.length)
        if (!c.infers) c.infers = new WeakMap<NodeProxy<T>, C>()
        if (c.infers.has(target)) return c.infers.get(target) as T
        const ret = inferImpl(target, c)
        c.infers.set(target, ret)
        return ret
}
