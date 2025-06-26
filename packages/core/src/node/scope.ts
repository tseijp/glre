import { int } from '.'
import { conversion, node } from './node'
import { getId } from './utils'
import type { FnLayout, NodeProps, NodeProxy, X } from './types'

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
        const y = node('variable', { id, inferFrom: x })
        const z = node('declare', null, x, y)
        addToScope(z)
        return y
}

export const assign = (x: X, y: X) => {
        const z = node('assign', null, x, y)
        addToScope(z)
        return x
}

export const If = (x: X, fun: () => void) => {
        const y = node('scope')
        scoped(y, fun)
        const ifNode = node('if', null, x, y)
        addToScope(ifNode)
        const ret = () => ({
                ElseIf: (_x: X, _fun: () => void) => {
                        const _y = node('scope')
                        scoped(_y, _fun)
                        ifNode.props.children!.push(_x, _y)
                        return ret()
                },
                Else: (_fun: () => void) => {
                        const _x = node('scope')
                        scoped(_x, _fun)
                        ifNode.props.children!.push(x)
                },
        })
        return ret()
}

export const Loop = (x: X, fun: (params: { i?: NodeProxy }) => void) => {
        const y = node('scope')
        scoped(y, () => fun({ i: node('variable', { id: 'i', inferFrom: int(0) }) }))
        const ret = node('loop', null, x, y)
        addToScope(ret)
        return ret
}

export const Switch = (x: X) => {
        const switchNode = node('switch', null, x)
        addToScope(switchNode)
        const ret = () => ({
                Case: (...values: X[]) => {
                        return (fun: () => void) => {
                                const y = node('scope')
                                scoped(y, fun)
                                for (const _x of values) switchNode.props.children!.push(_x, y)
                                return ret()
                        }
                },
                Default: (fun: () => void) => {
                        const scope = node('scope')
                        scoped(scope, fun)
                        switchNode.props.children!.push(scope)
                },
        })

        return ret()
}

export const Fn = (fun: (paramVars: NodeProxy[]) => NodeProxy) => {
        let layout: FnLayout
        const ret = (...args: X[]) => {
                const id = layout?.name || getId()
                const x = node('scope')
                let y: NodeProxy | undefined
                const paramVars: NodeProxy[] = []
                const paramDefs: NodeProps[] = []
                if (layout?.inputs)
                        for (const input of layout.inputs) {
                                paramDefs.push({ id: input.name, inferFrom: conversion(input.type) })
                        }
                else
                        for (let i = 0; i < args.length; i++) {
                                paramDefs.push({ id: `p${i}`, inferFrom: args[i] })
                        }
                for (const props of paramDefs) paramVars.push(node('variable', props))
                scoped(x, () => (y = fun(paramVars)))
                return node('define', { id, layout }, x, y, ...args)
        }
        ret.setLayout = (newLayout: FnLayout) => {
                layout = newLayout
                return ret
        }
        return ret
}
