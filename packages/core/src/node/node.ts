import { is } from '../utils/helpers'
import { OPERATORS } from './const'
import { isFunction, isOperator, isSwizzle } from './types'
import type { Functions, NodeProps, NodeProxy, NodeState, NodeTypes, Operators, Swizzles, X } from './types'

const converter = (x: X) => {
        return (hint: string) => {
                if (hint === 'string') return shader(x)
        }
}

export const node = (type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
        if (!props) props = {}
        if (args.length) props.children = args
        const x = new Proxy(() => {}, {
                get(_, key) {
                        if (key === Symbol.toPrimitive) return converter(x)
                        if (key === 'toString') return () => shader(x)
                        if (key === 'props') return props
                        if (key === 'type') return type
                        if (key === 'toVar') return () => i(...props.children!)
                        if (isSwizzle(key)) return s(key, x)
                        if (isOperator(key) || isFunction(key)) {
                                const _type = isOperator(key) ? 'operator' : 'function'
                                return (..._args: X[]) => node(_type, {}, key, x, ..._args)
                        }
                        return key
                },
                set(_, key, value) {
                        if (key === 'value') return value
                },
        }) as unknown as NodeProxy
        return x
}

let count = 0
export const i = (...args: X[]) => node('variable', { id: `i${count++}` }, ...args)
export const u = (key: string, defaultValue?: number | number[]) => node('uniform', { defaultValue }, key)
export const s = (key: Swizzles, arg: X) => node('swizzle', {}, key, arg)
export const n = (key: string, ...args: X[]) => node('node_type', {}, key, ...args)
export const o = (key: Operators, ...args: X[]) => node('operator', {}, key, ...args)
export const f = (key: Functions, ...args: X[]) => node('function', {}, key, ...args)

const joins = (children: X[], state: NodeState) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => shader(x, state))
                .join(', ')
}

export const shader = (x: X, state?: NodeState | null): string => {
        if (!state) state = {}
        if (is.num(x)) return x.toFixed(1)
        if (is.str(x)) return x
        if (!x) return ''
        const type = x.type
        const { id = '', children = [] } = x.props
        const { isWebGL } = state
        const [a, b, c] = children
        if (type === 'variable') {
                return id
        }
        if (type === 'swizzle') return `${shader(b, state)}.${shader(a, state)}`
        if (type === 'node_type') {
                if (!is.str(a)) throw ``
                const func = !isWebGL && a.startsWith('vec') ? `${a}f` : a
                const args = joins(children.slice(1), state)
                return `${func}(${args})`
        }
        if (type === 'operator') {
                if (a === 'not' || a === 'bitNot') return `${a}${shader(b, state)}`
                const op = OPERATORS[a as keyof typeof OPERATORS]
                return `(${shader(b, state)} ${op} ${shader(c, state)})`
        }
        if (type === 'function') {
                const funcName = a
                const args = joins(children.slice(1), state)
                return `${funcName}(${args})`
        }
        return shader(a, state)
}
