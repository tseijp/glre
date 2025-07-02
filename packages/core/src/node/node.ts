import { code } from './parsers/code'
import { assign, toVar } from './scope'
import {
        conversionToConstant,
        isConversion,
        isFunction,
        isOperator,
        isSwizzle,
        getId,
        isNodeProxy,
        isStruct,
} from './utils'
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
                if (isStruct(x)) return props[key as string]
        }
        const set = (_: unknown, key: string, y: X) => {
                if (isSwizzle(key)) {
                        swizzle(key, x).assign(y)
                        return true
                }
                if (isStruct(x)) {
                        dynamic(key, x).assign(y)
                        return true
                }
                return false
        }
        const x = new Proxy({}, { get, set }) as unknown as NodeProxy
        return x
}

// variables
export const variable = (id: string) => node('variable', { id })
export const builtin = (id: string) => node('builtin', { id })
export const select = (x: X, y: X, z: X) => node('ternary', null, x, y, z) // x ? y : z

// Node shorthands
export const swizzle = (key: Swizzles, arg: X) => node('swizzle', null, key, arg)
export const operator = (key: Operators, ...args: X[]) => node('operator', null, key, ...args)
export const function_ = (key: Functions, ...args: X[]) => node('function', null, key, ...args)
export const conversion = (key: string, ...args: X[]) => node('conversion', null, key, ...args)
export const dynamic = (field: string, ...args: X[]) => node('dynamic', { field }, ...args)

// headers
export const attribute = (x: X, id?: string) => {
        if (!id) id = getId()
        return node('attribute', { id }, x)
}

export const uniform = (x: X, id?: string) => {
        if (!id) id = getId()
        if (!isNodeProxy(x)) x = conversion(inferPrimitiveType(x))
        return node('uniform', { id }, x)
}

export const constant = (x: X, id?: string) => {
        if (!id) id = getId()
        return node('constant', { id }, x)
}

export const struct = (fields: Record<string, X>, id?: string) => {
        if (!id) id = getId()
        const structNode = node('struct', { fields, id })
        return () => {
                const ret = node('variable', { id: getId(), structNode })
                for (const field in fields) ret.props[field] = dynamic(field, ret, fields[field]) // ?? props
                return ret
        }
}
