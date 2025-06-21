import { shader } from './code'
import { isFunction, isOperator, isSwizzle } from './types'
import type { Functions, NodeProps, NodeProxy, NodeState, NodeTypes, Operators, Swizzles, X } from './types'

// currentStack global management
let currentStack: NodeProxy | null = null
let varCount = 0

export const setCurrentStack = (stack: NodeProxy | null) => {
        currentStack = stack
}

export const getCurrentStack = () => currentStack

const converter = (x: X) => {
        return (hint: string) => {
                if (hint === 'string') return shader(x)
        }
}

const addToStack = (node: NodeProxy) => {
        if (currentStack) {
                if (!currentStack.props.children) currentStack.props.children = []
                currentStack.props.children.push(node)
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
                                        const varName = customName || `v${varCount++}`
                                        const varNode = node('variable', { id: varName })
                                        const declareNode = node('declare', {}, varNode, x)
                                        addToStack(declareNode)
                                        return varNode
                                }
                        if (key === 'assign')
                                return (y: X) => {
                                        const assignNode = node('assign', {}, x, y)
                                        addToStack(assignNode)
                                        return x
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
                                const swizzleNode = s(key, x)
                                swizzleNode.assign(value)
                                return true
                        }
                        return false
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

const current = '??'

export const If = (condition: X, callback: () => void) => {
        const parentStack = getCurrentStack()
        const thenScope = node('scope', {})

        setCurrentStack(thenScope)
        callback()
        setCurrentStack(parentStack)

        const ifNode = node('if', {}, condition, thenScope)
        addToStack(ifNode)

        return {
                ElseIf: (elseCondition: X, elseCallback: () => void) => {
                        const elseScope = node('scope', {})
                        setCurrentStack(elseScope)
                        elseCallback()
                        setCurrentStack(parentStack)

                        if (!ifNode.props.children) ifNode.props.children = [condition, thenScope]
                        ifNode.props.children.push(elseCondition, elseScope)
                        return ifNode
                },
                Else: (elseCallback: () => void) => {
                        const elseScope = node('scope', {})
                        setCurrentStack(elseScope)
                        elseCallback()
                        setCurrentStack(parentStack)

                        if (!ifNode.props.children) ifNode.props.children = [condition, thenScope]
                        ifNode.props.children.push(elseScope)
                        return ifNode
                },
        }
}

export const Loop = (config: X, callback?: (params: { i: NodeProxy }) => void) => {
        const parentStack = getCurrentStack()
        const loopScope = node('scope', {})

        const iVar = node('variable', { id: 'i' })
        setCurrentStack(loopScope)
        if (callback) callback({ i: iVar })
        setCurrentStack(parentStack)

        const loopNode = node('loop', {}, config, loopScope)
        addToStack(loopNode)
        return loopNode
}

export const Fn = (callback: (params: any) => NodeProxy) => {
        return (...args: X[]) => {
                const parentStack = getCurrentStack()
                const fnScope = node('scope', {})

                setCurrentStack(fnScope)
                const result = callback(args)
                setCurrentStack(parentStack)

                return node('fn', {}, fnScope, result)
        }
}
