import { is } from '../utils/helpers'
import { code } from './code'
import { assign, toVar } from './scope'
import { conversionToConstant, isConversion, isFunction, isOperator, getId } from './utils'
import type { Functions, NodeProps, NodeProxy, NodeTypes, Operators, X, Constants as C } from './types'

const toPrimitive = (x: X, hint: string) => {
        if (hint === 'string') return code(x)
}

export const node = <T extends C>(type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
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
                if (key === '__nodeType') return undefined // Will be set by factory functions
                if (isOperator(key)) return (...y: X[]) => operator(key, x, ...y)
                if (isFunction(key)) return (...y: X[]) => function_([x], key, x, ...y)
                if (isConversion(key)) return () => conversion(conversionToConstant(key), x)
                if (is.str(key)) return member(key, x) // for struct and swizzling
        }
        const set = (_: unknown, key: string, y: X) => {
                if (key === 'value') listeners.forEach((fun) => fun(y))
                if (is.str(key)) member(key, x).assign(y)
                return true
        }
        const x = new Proxy({}, { get, set }) as unknown as NodeProxy<T>
        return x
}

// headers with proper type inference
export const member = <T extends C>(key: string, x: X) => node<T>('member', null, key, x)
export const select = <T extends C>(x: X, y: X, z: X) => node<T>('ternary', null, x, y, z) // z ? x : y @TODO REMOVE
export const attribute = <T extends C>(x: X, id = getId()) => node<T>('attribute', { id }, x)
export const constant = <T extends C>(x: X, id = getId()) => node<T>('constant', { id }, x)
export const uniform = <T extends C>(x: X, id = getId()) => node<T>('uniform', { id }, x)
export const variable = <T extends C>(id = getId()) => node<T>('variable', { id })
export const builtin = <T extends C>(id = getId()) => node<T>('builtin', { id })
export const vertexStage = <T extends C>(x: X, id = getId()) => {
        return node<T>('varying', { id, inferFrom: [x] }, x)
}

// Node shorthands with proper typing
export const operator = <T extends C>(key: Operators, ...x: X[]) => {
        return node<T>('operator', null, key, ...x)
}

export const function_ = <T extends C>(inferFrom: X[], key: Functions, ...x: X[]) => {
        return node<T>('function', { inferFrom }, key, ...x)
}

export const conversion = <T extends C>(key: T, ...x: X[]) => {
        return node<T>('conversion', null, key, ...x)
}
