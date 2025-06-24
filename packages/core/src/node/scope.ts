import { infer } from './infer'
import { node } from './node'
import { getId } from './utils'
import type { NodeProxy, X } from './types'

let _scope: NodeProxy | null = null

const scoped = (x: NodeProxy | null, fun = () => {}) => {
        const prev = _scope
        _scope = x
        fun()
        _scope = prev
}

const addToScope = (x: NodeProxy) => {
        if (!_scope) return // ignore
        if (!_scope.props.children) _scope.props.children = []
        _scope.props.children.push(x)
}

export const toVar = (x: X, id?: string) => {
        if (!id) id = getId()
        const y = node('variable', { id })
        const z = node('declare', null, y, x)
        addToScope(z)
        return y
}

export const assign = (x: X, y: X) => {
        const z = node('assign', null, x, y)
        addToScope(z)
        return x
}

export const If = (condition: X, fun: () => void) => {
        const scope = node('scope')
        scoped(scope, fun)
        const ifNode = node('if', null, condition, scope)
        addToScope(ifNode)
        const createChain = () => ({
                ElseIf: (x: X, _fun: () => void) => {
                        const y = node('scope')
                        scoped(y, _fun)
                        ifNode.props.children!.push(x, y)
                        return createChain()
                },
                Else: (_fun: () => void) => {
                        const x = node('scope')
                        scoped(x, _fun)
                        ifNode.props.children!.push(x)
                },
        })
        return createChain()
}

export const Loop = (x: X, fun: (params: { i?: NodeProxy }) => void) => {
        const y = node('scope')
        scoped(y, () => fun({ i: node('variable', { id: 'i' }) }))
        const ret = node('loop', null, x, y)
        addToScope(ret)
        return ret
}

export const Switch = (value: X) => {
        const switchNode = node('switch', null, value)
        addToScope(switchNode)
        const createChain = () => ({
                Case: (...values: X[]) => {
                        return (fun: () => void) => {
                                const scope = node('scope')
                                scoped(scope, fun)
                                // 複数のcase値を処理
                                for (const val of values) {
                                        switchNode.props.children!.push(val, scope)
                                }
                                return createChain()
                        }
                },
                Default: (fun: () => void) => {
                        const scope = node('scope')
                        scoped(scope, fun)
                        switchNode.props.children!.push(scope)
                },
        })

        return createChain()
}

export const Fn = (fun: (paramVars: NodeProxy[]) => NodeProxy) => {
        const id = getId()
        return (...args: X[]) => {
                const x = node('scope')
                let y: NodeProxy | undefined
                const paramVars: NodeProxy[] = []
                for (let i = 0; i < args.length; i++) {
                        const paramId = `p${i}`
                        const paramVar = node('variable', { id: paramId })
                        paramVars.push(paramVar)
                }
                scoped(x, () => (y = fun(paramVars)))
                const returnType = y ? infer(y) : 'void'
                const paramInfo = args.map((arg, i) => ({ name: `p${i}`, type: infer(arg) }))
                return node('define', { id, returnType, paramInfo }, x, y, ...args)
        }
}
