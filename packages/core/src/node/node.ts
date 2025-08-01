import { code, getConstant, isConversion, isFunction, isOperator, getId, isArrayAccess } from './utils'
import { assign, toVar } from './scope'
import { is } from '../utils/helpers'
import type { Functions, NodeProps, NodeProxy, NodeTypes, Operators, X, Constants as C } from './types'

const toPrimitive = (x: X, hint: string) => {
        if (hint === 'string') return code(x, null)
}

export const node = <T extends C>(type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
        if (!props) props = {}
        if (args.length) props.children = args
        const listeners = new Set<(value: any) => void>()
        const get = (_: unknown, key: string | Symbol) => {
                if (key === 'type') return type
                if (key === 'props') return props
                if (key === '__nodeType') return undefined // Will be inferred by TypeScript
                if (key === 'toVar') return toVar.bind(null, x)
                if (key === 'isProxy') return true
                if (key === 'toString') return code.bind(null, x)
                if (key === Symbol.toPrimitive) return toPrimitive.bind(null, x)
                if (key === 'listeners') return listeners
                if (key === 'attribute') return (id = getId()) => attribute(x, id)
                if (key === 'constant') return (id = getId()) => constant(x, id)
                if (key === 'uniform') return (id = getId()) => uniform(x, id)
                if (key === 'variable') return (id = getId()) => variable(id)
                if (key === 'builtin') return (id = getId()) => builtin(id)
                if (key === 'vertexStage') return (id = getId()) => vertexStage(x, id)
                if (key === 'element') return (arg: X) => (type === 'storage' ? gather(x, arg) : element(x, arg))
                if (key === 'member') return (arg: X) => member(x, arg)
                if (key === 'assign') return assign.bind(null, x, x.type === 'gather')
                if (isOperator(key)) return (...args: X[]) => operator(key, x, ...args)
                if (isFunction(key)) return (...args: X[]) => function_(key, x, ...args)
                if (isConversion(key)) return () => conversion(getConstant(key), x)
                if (is.str(key)) return isArrayAccess(key) ? element(x, key) : member(x, key)
        }
        const set = (_: unknown, key: string, arg: X) => {
                if (key === 'value') listeners.forEach((fun) => fun(arg))
                if (is.str(key)) member(x, key).assign(arg)
                return true
        }
        const x = new Proxy({}, { get, set }) as unknown as NodeProxy<T>
        return x
}

// headers with proper type inference
export const attribute = <T extends C>(x: X<T>, id = getId()) => node<T>('attribute', { id }, x)
export const constant = <T extends C>(x: X<T>, id = getId()) => node<T>('constant', { id }, x)
export const uniform = <T extends C>(x: X<T>, id = getId()) => node<T>('uniform', { id }, x)
export const storage = <T extends C>(x: X<T>, id = getId()) => node<T>('storage', { id }, x)
export const variable = <T extends C>(id = getId()) => node<T>('variable', { id })
export const builtin = <T extends C>(id = getId()) => node<T>('builtin', { id })
export const vertexStage = <T extends C>(x: X<T>, id = getId()) => {
        return node<T>('varying', { id, inferFrom: [x] }, x)
}

// Node shorthands with proper typing
export const member = <T extends C>(x: X, index: X) => node<T>('member', null, x, index)
export const element = <T extends C>(x: X, index: X) => node<T>('element', null, x, index)
export const gather = <T extends C>(x: X, index: X) => node<T>('gather', null, x, index)
export const scatter = <T extends C>(x: X, index: X) => node<T>('scatter', null, x, index)
export const select = <T extends C>(x: X<T>, y: X<T>, z: X) => node<T>('ternary', null, x, y, z) // z ? x : y @TODO REMOVE
export const operator = <T extends C>(key: Operators, ...x: X[]) => node<T>('operator', null, key, ...x)
export const function_ = <T extends C>(key: Functions, ...x: X[]) => node<T>('function', null, key, ...x)
export const conversion = <T extends C>(key: T, ...x: X[]) => node<T>('conversion', null, key, ...x)
