import { code } from './code'
import { assign, toVar } from './scope'
import { conversionToConstant, isConversion, isFunction, isOperator, isSwizzle, getId, isNodeProxy } from './utils'
import { inferPrimitiveType } from './infer'
import type { Functions, NodeProps, NodeProxy, NodeTypes, Operators, Swizzles, X } from './types'

const toPrimitive = (x: X, hint: string) => {
        if (hint === 'string') return code(x)
}

export const node = (type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
        if (!props) props = {}
        if (args.length) props.children = args
        const get = (_: unknown, key: string | Symbol) => {
                if (key === 'type') return type
                if (key === 'props') return props
                if (key === 'toVar') return toVar.bind(null, x)
                if (key === 'assign') return assign.bind(null, x)
                if (key === 'isProxy') return true
                if (key === 'toString') return code.bind(null, x)
                if (key === Symbol.toPrimitive) return toPrimitive.bind(null, x)
                if (isSwizzle(key)) return swizzle(key, x)
                if (isOperator(key)) return (...y: X[]) => operator(key, x, ...y)
                if (isFunction(key)) return (...y: X[]) => function_(key, x, ...y)
                if (isConversion(key)) return () => conversion(conversionToConstant(key), x)
        }
        const set = (_: unknown, key: string, y: X) => {
                if (isSwizzle(key)) {
                        swizzle(key, x).assign(y)
                        return true
                }
                return false
        }
        const x = new Proxy({}, { get, set }) as unknown as NodeProxy
        return x
}

// headers
export const attribute = (x: X, id?: string) => {
        if (!id) id = getId()
        node('attribute', { id }, x)
}

export const uniform = (x: X, id?: string) => {
        if (!id) id = getId()
        if (!isNodeProxy(x)) x = conversion(inferPrimitiveType(x))
        return node('uniform', { id }, x)
}

export const varying = (x: X, id?: string) => node('varying', { id }, x)
export const constant = (x: X, id?: string) => node('constant', { id }, x)
export const variable = (id: string) => node('variable', { id })
export const builtin = (id: string) => node('builtin', { id })

// Node shorthands
export const swizzle = (key: Swizzles, arg: X) => node('swizzle', null, key, arg)
export const operator = (key: Operators, ...args: X[]) => node('operator', null, key, ...args)
export const function_ = (key: Functions, ...args: X[]) => node('function', null, key, ...args)
export const conversion = (key: string, ...args: X[]) => node('conversion', null, key, ...args)

// x ? y : z
export const select = (x: X, y: X, z: X) => node('ternary', null, x, y, z)
