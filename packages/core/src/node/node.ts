import { code } from './code'
import { assign, toVar, toConst } from './scope'
import { getId, isConversion, isFunction, isOperator, isSwizzle } from './utils'
import type { Functions, NodeProps, NodeProxy, NodeTypes, Operators, Swizzles, X } from './types'

const toPrimitive = (x: X) => {
        return (hint: string) => {
                if (hint === 'string') return code(x)
        }
}

export const node = (type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
        if (!props) props = {}
        if (args.length) props.children = args
        const x = new Proxy(() => {}, {
                get(_, key) {
                        if (key === 'type') return type
                        if (key === 'props') return props
                        if (key === 'toVar') return toVar(x)
                        if (key === 'toConst') return toConst(x)
                        if (key === 'assign') return assign(x)
                        if (key === 'isProxy') return true
                        if (key === 'toString') return code.bind(null, x)
                        if (key === Symbol.toPrimitive) return toPrimitive(x)
                        if (isSwizzle(key)) return s(key, x)
                        if (isOperator(key)) return (...y: X[]) => o(key, x, ...y)
                        if (isFunction(key)) return (...y: X[]) => f(key, x, ...y)
                        if (isConversion(key)) return n(key, x)
                },
                set(_, key, value) {
                        if (isSwizzle(key)) {
                                s(key, x).assign(value)
                                return true
                        }
                        return false
                },
        }) as unknown as NodeProxy
        return x
}

// Node shorthands
export const v = (...args: X[]) => node('variable', { id: getId() }, ...args)
export const u = (id: string, defaultValue?: number | number[] | boolean) => node('uniform', { id, defaultValue })
export const s = (key: Swizzles, arg: X) => node('swizzle', null, key, arg)
export const n = (key: string, ...args: X[]) => node('conversions', null, key, ...args)
export const o = (key: Operators, ...args: X[]) => node('operator', null, key, ...args)
export const f = (key: Functions, ...args: X[]) => node('math_fun', null, key, ...args)

export const select = (x: X, y: X, z: X) => node('ternary', null, x, y, z)
