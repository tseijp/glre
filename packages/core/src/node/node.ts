import { shader } from './code'
import { isFunction, isOperator, isSwizzle } from './types'
import type { Functions, NodeProps, NodeProxy, NodeState, NodeTypes, Operators, Swizzles, X, ScopeNode } from './types'
import { generateVariableName, inferType } from './utils'

// Global scope management
let currentScope: ScopeNode | null = null
const scopeStack: ScopeNode[] = []

export const getCurrentScope = (): ScopeNode | null => currentScope
export const setCurrentScope = (scope: ScopeNode | null): void => {
        currentScope = scope
}
export const pushScope = (scope: ScopeNode): void => {
        if (currentScope) scopeStack.push(currentScope)
        currentScope = scope
}
export const popScope = (): ScopeNode | null => {
        const prev = currentScope
        currentScope = scopeStack.pop() || null
        return prev
}

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
                        if (key === 'id') return props?.id
                        if (key === 'children') return props?.children
                        if (key === 'toVar')
                                return (name?: string) => {
                                        const scope = getCurrentScope()
                                        if (!scope) {
                                                throw new Error('toVar can only be used within a scope')
                                        }

                                        const varName = name || generateVariableName('v')
                                        const varType = inferType(x)

                                        const varNode = node('variable', {
                                                id: varName,
                                                variableName: varName,
                                                variableType: varType,
                                                isDeclaration: true,
                                        }) as any

                                        const assignNode = node('variable', {
                                                id: 'assign',
                                                children: [varNode, x],
                                        }) as any

                                        scope.lines.push(assignNode)
                                        scope.variables.set(varName, varNode)

                                        return node('variable', {
                                                id: varName,
                                                variableName: varName,
                                                variableType: varType,
                                                isDeclaration: false,
                                        })
                                }
                        if (key === 'assign')
                                return (value: X) => {
                                        if (x.type !== 'variable') {
                                                throw new Error('assign can only be called on variables')
                                        }
                                        const scope = getCurrentScope()
                                        if (!scope) {
                                                throw new Error('assign can only be used within a scope')
                                        }

                                        const assignNode = node('variable', {
                                                id: 'assign',
                                                children: [x, value],
                                        }) as any

                                        scope.lines.push(assignNode)
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

export const If = (condition: X, callback: () => void) => {
        const ifScope = node('scope', { scopeType: 'if' }) as any as ScopeNode
        ifScope.lines = []
        ifScope.variables = new Map()

        const conditionNode = node('variable', {
                id: 'if',
                children: [condition, ifScope],
        }) as any

        pushScope(ifScope)
        try {
                callback()
        } finally {
                popScope()
        }

        const currentScope = getCurrentScope()
        if (currentScope) {
                currentScope.lines.push(conditionNode)
        }

        return {
                ElseIf: (newCondition: X, newCallback: () => void) => {
                        const elseIfScope = node('scope', { scopeType: 'if' }) as any as ScopeNode
                        elseIfScope.lines = []
                        elseIfScope.variables = new Map()

                        const elseIfNode = node('variable', {
                                id: 'elseif',
                                children: [newCondition, elseIfScope],
                        }) as any

                        pushScope(elseIfScope)
                        try {
                                newCallback()
                        } finally {
                                popScope()
                        }

                        if (currentScope) {
                                currentScope.lines.push(elseIfNode)
                        }

                        return this
                },
                Else: (elseCallback: () => void) => {
                        const elseScope = node('scope', { scopeType: 'if' }) as any as ScopeNode
                        elseScope.lines = []
                        elseScope.variables = new Map()

                        const elseNode = node('variable', {
                                id: 'else',
                                children: [elseScope],
                        }) as any

                        pushScope(elseScope)
                        try {
                                elseCallback()
                        } finally {
                                popScope()
                        }

                        if (currentScope) {
                                currentScope.lines.push(elseNode)
                        }
                },
        }
}

interface LoopOptions {
        start?: X
        end: X
        type?: string
}

export const Loop = (options: LoopOptions | X, callback?: (params: { i: X }) => void) => {
        const loopScope = node('scope', { scopeType: 'loop' }) as any as ScopeNode
        loopScope.lines = []
        loopScope.variables = new Map()

        const indexVarName = generateVariableName('i')
        const indexVar = node('variable', {
                id: indexVarName,
                variableName: indexVarName,
                variableType: 'int',
                isDeclaration: true,
        })

        const loopNode = node('variable', {
                id: 'loop',
                children: [options, indexVar, loopScope],
        }) as any

        if (callback) {
                pushScope(loopScope)
                try {
                        callback({ i: indexVar })
                } finally {
                        popScope()
                }
        }

        const currentScope = getCurrentScope()
        if (currentScope) {
                currentScope.lines.push(loopNode)
        }
}

export const Fn = (callback: (params: any) => X) => {
        return (...args: X[]) => {
                const fnScope = node('scope', { scopeType: 'function' }) as any as ScopeNode
                fnScope.lines = []
                fnScope.variables = new Map()

                pushScope(fnScope)
                let result: X
                try {
                        result = callback({})
                } finally {
                        popScope()
                }

                return node('variable', {
                        id: 'function_call',
                        children: [fnScope, result, ...args],
                })
        }
}
