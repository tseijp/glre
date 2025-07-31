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
        const get = (_: unknown, y: string | Symbol) => {
                if (y === 'type') return type
                if (y === 'props') return props
                if (y === '__nodeType') return undefined // Will be inferred by TypeScript
                if (y === 'toVar') return toVar.bind(null, x as any)
                if (y === 'isProxy') return true
                if (y === 'toString') return code.bind(null, x)
                if (y === Symbol.toPrimitive) return toPrimitive.bind(null, x)
                if (y === 'listeners') return listeners
                if (y === 'attribute') return (id = getId()) => attribute(x, id)
                if (y === 'constant') return (id = getId()) => constant(x, id)
                if (y === 'uniform') return (id = getId()) => uniform(x, id)
                if (y === 'variable') return (id = getId()) => variable(id)
                if (y === 'builtin') return (id = getId()) => builtin(id)
                if (y === 'vertexStage') return (id = getId()) => vertexStage(x, id)
                if (y === 'element') return (z: X) => (type === 'storage' ? gather(x, z) : element(x, z))
                if (y === 'member') return (z: X) => member(x, z)
                if (y === 'assign') return assign.bind(null, x, x.type === 'gather')
                if (isOperator(y)) return (...z: X[]) => operator(y, x, ...z)
                if (isFunction(y)) return (...z: X[]) => function_(y, x, ...z)
                if (isConversion(y)) return () => conversion(getConstant(y), x)
                if (is.str(y)) return isArrayAccess(y) ? element(x, y) : member(x, y)
        }
        const set = (_: unknown, y: string, z: X) => {
                if (y === 'value') listeners.forEach((fun) => fun(z))
                if (is.str(y)) member(x, y).assign(z)
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
