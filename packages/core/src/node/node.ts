import { shader } from './code'
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
                        if (key === 'isProxy') return true
                        if (key === 'props') return props
                        if (key === 'type') return type
                        if (key === 'toVar')
                                return (customName?: string) => {
                                        const varNode = i(...(props.children || []))
                                        varNode.props.isVariable = true
                                        varNode.props.variableName = customName
                                        return varNode
                                }
                        if (key === 'assign')
                                return (y: X) => {
                                        return node('assign', {}, x, y)
                                }
                        if (isSwizzle(key)) return s(key, x)
                        if (isOperator(key) || isFunction(key)) {
                                const _type = isOperator(key) ? 'operator' : 'function'
                                return (..._args: X[]) => node(_type, {}, key, x, ..._args)
                        }
                        return key
                },
                set(_, key, value) {
                        if (isSwizzle(key)) {
                                // ???
                        }
                        return value
                },
        }) as unknown as NodeProxy
        return x
}

let count = 0

export const i = (...args: X[]) => node('variable', { id: `i${count++}`, isVariable: true }, ...args)
export const u = (key: string, defaultValue?: number | number[]) => node('uniform', { defaultValue }, key)
export const s = (key: Swizzles, arg: X) => node('swizzle', {}, key, arg)
export const n = (key: string, ...args: X[]) => node('node_type', {}, key, ...args)
export const o = (key: Operators, ...args: X[]) => node('operator', {}, key, ...args)
export const f = (key: Functions, ...args: X[]) => node('function', {}, key, ...args)

const current = '??'

export const If = (x: X, fun: () => void) => {
        const ret = {
                ElseIf: (y: X, fun: () => void) => {
                        // ???
                },
                Else: (fun: () => void) => {
                        // ???
                },
        }
        return ret
}

export const Loop = (count: X, fun?: () => void) => {
        // ???
}

export const Fn = (callback: (params: any) => NodeProxy) => {
        return (...args: X[]) => {
                // ???
        }
}
