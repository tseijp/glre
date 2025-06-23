import { node } from './node'
import { getId } from './utils'
import type { NodeProxy, X } from './types'

let _scope: NodeProxy | null = null
let _functions: Map<string, NodeProxy> = new Map()

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

const addFunction = (id: string, fnNode: NodeProxy) => {
        _functions.set(id, fnNode)
}

export const getFunctions = () => _functions

export const clearFunctions = () => {
        _functions.clear()
}

export const If = (condition: X, callback: () => void) => {
        const scope = node('scope')
        scoped(scope, callback)
        const ifNode = node('if', null, condition, scope)
        addToScope(ifNode)
        const createChain = () => ({
                ElseIf: (newCondition: X, elseIfCallback: () => void) => {
                        const elseIfScope = node('scope')
                        scoped(elseIfScope, elseIfCallback)
                        ifNode.props.children!.push(newCondition, elseIfScope)
                        return createChain()
                },
                Else: (elseCallback: () => void) => {
                        const elseScope = node('scope')
                        scoped(elseScope, elseCallback)
                        ifNode.props.children!.push(elseScope)
                },
        })
        return createChain()
}

export const Loop = (x: X, callback?: (params: { i: NodeProxy }) => void) => {
        const y = node('scope')
        scoped(y, () => callback?.({ i: node('variable', { id: 'i' }) }))
        const ret = node('loop', null, x, y)
        addToScope(ret)
        return ret
}

export const Switch = (value: X) => {
        const switchNode = node('switch', null, value)
        addToScope(switchNode)
        const createChain = () => ({
                Case: (...values: X[]) => {
                        return (callback: () => void) => {
                                const caseScope = node('scope')
                                scoped(caseScope, callback)
                                const caseNode = node('case', null, ...values, caseScope)
                                switchNode.props.children!.push(caseNode)
                                return createChain()
                        }
                },
                Default: (callback: () => void) => {
                        const defaultScope = node('scope')
                        scoped(defaultScope, callback)
                        const defaultNode = node('default', null, defaultScope)
                        switchNode.props.children!.push(defaultNode)
                },
        })

        return createChain()
}

export const Fn = (callback: (args: X[]) => NodeProxy) => {
        const fnId = getId()
        
        const fnWrapper = (...args: X[]) => {
                let result: NodeProxy | undefined
                const fnScope = node('scope')
                
                // Parse parameters from callback signature
                const fnStr = callback.toString()
                const paramMatch = fnStr.match(/\(\s*(?:\[\s*([^\]]+)\s*\]|\{\s*([^}]+)\s*\}|([^)]+))\s*\)/)
                let paramNames: string[] = []
                
                if (paramMatch) {
                        const paramStr = paramMatch[1] || paramMatch[2] || paramMatch[3] || ''
                        paramNames = paramStr.split(',').map(p => {
                                const cleanParam = p.split('=')[0].trim().replace(/[{}\[\]]/g, '')
                                return cleanParam || `arg${paramNames.length}`
                        }).filter(Boolean)
                }
                
                // 引数の型を推論
                const { infer, inferParameterTypes } = require('./infer')
                const argTypes = inferParameterTypes(args)
                
                // Create parameter nodes with inferred types
                const paramNodes = paramNames.map((name, i) => {
                        const paramType = argTypes[i] || 'float'
                        const paramNode = node('variable', { 
                                id: name.trim(), 
                                returnType: paramType 
                        })
                        return paramNode
                })
                
                scoped(fnScope, () => {
                        result = callback(paramNodes)
                })
                
                // 戻り値の型を推論
                const returnType = result ? infer(result) : 'void'
                
                const fnDef = node('fn_def', { 
                        id: fnId, 
                        paramNames,
                        paramTypes: argTypes,
                        returnType
                }, fnScope, result!)
                
                addFunction(fnId, fnDef)
                
                return node('fn_run', { id: fnId, returnType }, ...args)
        }
        
        fnWrapper.fnId = fnId
        return fnWrapper
}

export const toVar = (x: X) => (id?: string) => {
        if (!id) id = getId()
        const y = node('variable', { id })
        const z = node('declare', null, y, x)
        addToScope(z)
        return y
}

export const toConst = (x: X) => (id?: string) => {
        if (!id) id = getId()
        const y = node('constant', { id })
        const z = node('declare', null, y, x)
        addToScope(z)
        return y
}

export const assign = (x: X) => (y: X) => {
        const assignNode = node('assign', null, x, y)
        addToScope(assignNode)
        return x
}

export const varying = (value: X, name?: string) => {
        if (!name) name = getId()
        const varyingVar = node('varying', { id: name })
        const declaration = node('declare', null, varyingVar, value)
        addToScope(declaration)
        return varyingVar
}
