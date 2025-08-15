import { compute, fragment, vertex } from './build'
import { addToScope, assign, toVar } from './scope'
import { code, getConstant, isConversion, isFunction, isOperator, getId, isArrayAccess } from './utils'
import { is } from '../utils/helpers'
import type { Constants as C, Functions, NodeProps, NodeTypes, Operators, X, Y } from './types'

const toPrimitive = (x: Y, hint: string) => {
        if (hint === 'string') return code(x as any, null)
}

export const create = <T extends C>(type: NodeTypes, props?: NodeProps | null, ...args: Y[]) => {
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
                if (key === 'fragment') return fragment.bind(null, x)
                if (key === 'compute') return compute.bind(null, x)
                if (key === 'vertex') return vertex.bind(null, x)
                if (key === Symbol.toPrimitive) return toPrimitive.bind(null, x)
                if (key === 'listeners') return listeners
                if (key === 'attribute') return (id = getId()) => attribute(x, id)
                if (key === 'instance') return (id = getId()) => instance(x, id)
                if (key === 'constant') return (id = getId()) => constant(x, id)
                if (key === 'uniform') return (id = getId()) => uniform(x, id)
                if (key === 'variable') return (id = getId()) => variable(id)
                if (key === 'builtin') return (id = getId()) => builtin(id)
                if (key === 'vertexStage') return (id = getId()) => vertexStage(x, id)
                if (key === 'element') return (arg: Y) => (type === 'storage' ? gather(x, arg) : element(x, arg))
                if (key === 'member') return (arg: Y) => member(x, arg)
                if (key === 'assign') return assign.bind(null, x, x.type === 'gather')
                if (key === 'select') return select.bind(null, x)
                if (isOperator(key)) {
                        return key.endsWith('Assign')
                                ? (...args: Y[]) => addToScope(operator(key, x, ...args))
                                : (...args: Y[]) => operator(key, x, ...args)
                }
                if (isFunction(key)) return (...args: Y[]) => function_(key, x, ...args)
                if (isConversion(key)) return () => conversion(getConstant(key), x)
                if (is.str(key)) return isArrayAccess(key) ? element(x, key) : member(x, key)
        }
        const set = (_: unknown, key: string, arg: Y) => {
                if (key === 'value') listeners.forEach((fun) => fun(arg))
                if (is.str(key)) member(x, key).assign(arg)
                return true
        }
        const x = new Proxy({}, { get, set }) as unknown as X<T>
        return x
}

// headers with proper type inference
export const attribute = <T extends C>(x: Y<T>, id = getId()) => create<T>('attribute', { id }, x)
export const instance = <T extends C>(x: Y<T>, id = getId()) => create<T>('instance', { id }, x)
export const constant = <T extends C>(x: Y<T>, id = getId()) => create<T>('constant', { id }, x)
export const uniform = <T extends C>(x: Y<T>, id = getId()) => create<T>('uniform', { id }, x)
export const storage = <T extends C>(x: Y<T>, id = getId()) => create<T>('storage', { id }, x)
export const variable = <T extends C>(id = getId()) => create<T>('variable', { id })
export const builtin = <T extends C>(id = getId()) => create<T>('builtin', { id })
export const vertexStage = <T extends C>(x: X<T>, id = getId()) => {
        return create<T>('varying', { id, inferFrom: [x] }, x)
}

// Node shorthands with proper typing
export const member = <T extends C>(x: X, index: Y) => create<T>('member', null, x, index)
export const element = <T extends C>(x: X, index: Y) => create<T>('element', null, x, index)
export const gather = <T extends C>(x: X, index: Y) => create<T>('gather', null, x, index)
export const scatter = <T extends C>(x: X, index: Y) => create<T>('scatter', null, x, index)
export const select = <T extends C>(x: Y, y: Y, z: Y) => create<T>('ternary', null, x, y, z) // z ? x : y @TODO REMOVE
export const operator = <T extends C>(key: Operators, ...x: Y[]) => create<T>('operator', null, key, ...x)
export const function_ = <T extends C>(key: Functions, ...x: Y[]) => create<T>('function', null, key, ...x)
export const conversion = <T extends C>(key: T, ...x: Y[]) => create<T>('conversion', null, key, ...x)
