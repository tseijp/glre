import { node } from './node'
import { getId } from './utils'
import type { NodeProxy, X } from './types'

let _scope: NodeProxy | null = null

const scoped = (x: NodeProxy | null, callback = () => {}) => {
        const prev = _scope
        _scope = x
        callback()
        _scope = prev
}

const addToScope = (x: NodeProxy) => {
        if (!_scope) return // ignore
        if (!_scope.props.children) _scope.props.children = []
        _scope.props.children.push(x)
}

export const If = (x: X, callback: () => void) => {
        const y = node('scope')
        scoped(y, callback)
        const ifNode = node('if', null, x, y)
        addToScope(ifNode)
        return {
                ElseIf: (y: X, elseCallback: () => void) => {
                        const z = node('scope')
                        scoped(z, elseCallback)
                        ifNode.props.children!.push(y, z)
                },
                Else: (elseCallback: () => void) => {
                        const z = node('scope')
                        scoped(z, elseCallback)
                        ifNode.props.children!.push(z)
                },
        }
}

export const Loop = (x: X, callback?: (params: { i: NodeProxy }) => void) => {
        const y = node('scope')
        scoped(y, () => callback?.({ i: node('variable', { id: 'i' }) }))
        const ret = node('loop', null, x, y)
        addToScope(ret)
        return ret
}

export const Fn = (callback: (args: X[]) => NodeProxy) => {
        return (...args: X[]) => {
                let result
                const fnScope = node('scope')
                scoped(fnScope, () => (result = callback(args)))
                return node('fn', null, fnScope, result)
        }
}

export const toVar = (x: X) => (id: string) => {
        if (!id) id = getId()
        const y = node('variable', { id })
        const z = node('declare', null, y, x)
        addToScope(z)
        return y
}

export const assign = (x: X) => (y: X) => {
        const assignNode = node('assign', null, x, y)
        addToScope(assignNode)
        return x
}
