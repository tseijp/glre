import { code } from './code'
import { addToScope } from './scope'
import { isFunction, isOperator, isSwizzle } from './types'
import type { Functions, NodeConfig, NodeProps, NodeProxy, NodeTypes, Operators, Swizzles, X } from './types'

let varCount = 0

const toVar = (x: X) => (varName?: string) => {
        if (!varName) varName = `v${varCount++}`
        const varNode = node('variable', { id: varName })
        const declareNode = node('declare', {}, varNode, x)
        addToScope(declareNode)
        return varNode
}

const assign = (x: X) => (y: X) => {
        const assignNode = node('assign', {}, x, y)
        addToScope(assignNode)
        return x
}

const toPrimitive = (x: X) => {
        return (hint: string) => {
                if (hint === 'string') return code(x)
        }
}

export const node = (type: NodeTypes, props?: NodeProps | null, ...args: X[]) => {
        if (!props) props = {}
        if (args.length) props.children = args
        const x = new Proxy(() => {}, {
                get(_, key) {
                        if (key === 'type') return type
                        if (key === 'props') return props
                        if (key === 'toVar') return toVar(x)
                        if (key === 'assign') return assign(x)
                        if (key === 'isProxy') return true
                        if (key === 'toString') return (c?: NodeConfig) => code(x, c)
                        if (key === Symbol.toPrimitive) return toPrimitive(x)
                        if (isSwizzle(key)) return s(key, x)
                        if (isOperator(key)) return (...y: X[]) => node('operator', {}, key, x, ...y)
                        if (isFunction(key)) return (...y: X[]) => node('math_fun', {}, key, x, ...y)
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
export const f = (key: Functions, ...args: X[]) => node('math_fun', {}, key, ...args)
