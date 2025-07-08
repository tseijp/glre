import { code } from './code'
import { assign, toVar } from './scope'
import { conversionToConstant, isConversion, isFunction, isOperator, isSwizzle, getId } from './utils'
import type { Functions, NodeProps, NodeProxy, NodeTypes, Operators, Swizzles, X } from './types'

const toPrimitive = (x: X, hint: string) => {
        if (hint === 'string') return code(x)
}

export const node = (type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
        if (!props) props = {}
        if (args.length) props.children = args
        const listeners = new Set<(value: any) => void>()
        const get = (_: unknown, key: string | Symbol) => {
                if (key === 'type') return type
                if (key === 'props') return props
                if (key === 'toVar') return toVar.bind(null, x)
                if (key === 'assign') return assign.bind(null, x)
                if (key === 'isProxy') return true
                if (key === 'toString') return code.bind(null, x)
                if (key === Symbol.toPrimitive) return toPrimitive.bind(null, x)
                if (key === 'listeners') return listeners
                if (isSwizzle(key)) return swizzle(key, x)
                if (isOperator(key)) return (...y: X[]) => operator(key, x, ...y)
                if (isFunction(key)) return (...y: X[]) => function_(key, x, ...y)
                if (isConversion(key)) return () => conversion(conversionToConstant(key), x)
                // struct member access
                if (type === 'struct' && typeof key === 'string' && props.fields?.[key]) {
                        return member(key, x)
                }
        }
        const set = (_: unknown, key: string, y: X) => {
                if (key === 'value') listeners.forEach((fun) => fun(y))
                if (isSwizzle(key)) swizzle(key, x).assign(y)
                return true
        }
        const x = new Proxy({}, { get, set }) as unknown as NodeProxy
        return x
}

// headers
export const attribute = (x: X, id = getId()) => node('attribute', { id }, x)
export const constant = (x: X, id = getId()) => node('constant', { id }, x)
export const uniform = (x: X, id = getId()) => node('uniform', { id }, x)
export const variable = (id = getId()) => node('variable', { id })
export const builtin = (id = getId()) => node('builtin', { id })
export const vertexStage = (x: X, id = getId()) => node('varying', { id, inferFrom: [x] }, x)

// Node shorthands
export const swizzle = (key: Swizzles, x: X) => node('swizzle', null, key, x)
export const operator = (key: Operators, ...x: X[]) => node('operator', null, key, ...x)
export const function_ = (key: Functions, ...x: X[]) => node('function', null, key, ...x)
export const conversion = (key: string, ...x: X[]) => node('conversion', null, key, ...x)
export const select = (x: X, y: X, z: X) => node('ternary', null, x, y, z) // x ? y : z

// Struct functions
export const struct = (fields: Record<string, X>) => {
        const id = getId()
        const structNode = node('struct', { id, fields })
        // Create constructor function
        const constructor = () => node('struct', { id: getId(), type: id })
        Object.assign(constructor, structNode)
        return constructor as any
}
export const member = (key: string, x: X) => node('member', null, key, x)
