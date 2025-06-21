import { node } from './node'
import type { NodeProxy, X } from './types'

// currentScope global management
let currentScope: NodeProxy | null = null

export const setCurrentScope = (node: NodeProxy | null) => {
        currentScope = node
}

export const getCurrentScope = () => currentScope

export const addToScope = (node: NodeProxy) => {
        if (!currentScope) return // ignore
        if (!currentScope.props.children) currentScope.props.children = []
        currentScope.props.children.push(node)
}

export const If = (x: X, callback: () => void) => {
        const parentScope = getCurrentScope()
        const y = node('scope', {})

        setCurrentScope(y)
        callback()
        setCurrentScope(parentScope)

        const ifNode = node('if', {}, x, y)
        addToScope(ifNode)

        return {
                ElseIf: (y: X, elseCallback: () => void) => {
                        const z = node('scope', {})
                        setCurrentScope(z)
                        elseCallback()
                        setCurrentScope(parentScope)
                        ifNode.props.children!.push(y, z)
                        return ifNode
                },
                Else: (elseCallback: () => void) => {
                        const z = node('scope', {})
                        setCurrentScope(z)
                        elseCallback()
                        setCurrentScope(parentScope)
                        ifNode.props.children!.push(z)
                        return
                },
        }
}

export const Loop = (x: X, callback?: (params: { i: NodeProxy }) => void) => {
        const parentScope = getCurrentScope()
        const y = node('scope', {})

        const iNode = node('variable', { id: 'i' })
        setCurrentScope(y)
        if (callback) callback({ i: iNode })
        setCurrentScope(parentScope)

        const loopNode = node('loop', {}, x, y)
        addToScope(loopNode)
        return loopNode
}

export const Fn = (callback: (params: any) => NodeProxy) => {
        return (...args: X[]) => {
                const parentScope = getCurrentScope()
                const fnScope = node('scope', {})

                setCurrentScope(fnScope)
                const result = callback(args)
                setCurrentScope(parentScope)

                return node('fn', {}, fnScope, result)
        }
}
