import { code } from './code'
import { assign, toVar } from './scope'
import { getId, isConversion, isFunction, isOperator, isSwizzle } from './utils'
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
                if (key === 'toConst') return toConst.bind(null, x)
                if (key === 'assign') return assign.bind(null, x)
                if (key === 'isProxy') return true
                if (key === 'toString') return code.bind(null, x)
                if (key === Symbol.toPrimitive) return toPrimitive.bind(null, x)
                if (isSwizzle(key)) return swizzle(key, x)
                if (isOperator(key)) return (...y: X[]) => operator(key, x, ...y)
                if (isFunction(key)) return (...y: X[]) => function_(key, x, ...y)
                if (isConversion(key)) return conversion(key, x)
        }
        const set = (_: unknown, key: string, value: X) => {
                if (isSwizzle(key)) {
                        swizzle(key, x).assign(value)
                        return true
                }
                return false
        }
        const x = new Proxy({}, { get, set }) as unknown as NodeProxy
        return x
}

// Node shorthands
export const variable = (...args: X[]) => node('variable', { id: getId() }, ...args)
export const swizzle = (key: Swizzles, arg: X) => node('swizzle', null, key, arg)
export const operator = (key: Operators, ...args: X[]) => node('operator', null, key, ...args)
export const function_ = (key: Functions, ...args: X[]) => node('function', null, key, ...args)
export const conversion = (key: string, ...args: X[]) => node('conversion', null, key, ...args)

// uniform and attribute
export const uniform = (value: number | number[] | boolean, id: string) => {
        return node('uniform', { id, value })
}

export const toConst = (x: X, id?: string) => {
        // @TODO FIX
        // if (!id) id = getId()
        // const y = node('constant', { id })
        // const z = node('declare', null, y, x)
        // addToScope(z)
        // return y
}
export const varying = (value: X, name?: string) => {
        // @TODO FIX
        // if (!name) name = getId()
        // const varyingVar = node('varying', { id: name })
        // const declaration = node('declare', null, varyingVar, value)
        // addToScope(declaration)
        // return varyingVar
}
