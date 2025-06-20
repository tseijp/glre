import { is } from '../utils/helpers'
import { OPERATORS, VARIABLE_MAPPING } from './const'
import { generateFragmentMain, joins, inferGLSLType } from './utils'
import type { NodeState, X, ScopeNode } from './types'

export const shader = (x: X, state?: NodeState | null): string => {
        if (!state)
                state = {
                        lines: [],
                        variables: new Map(),
                        indent: 0,
                        uniforms: new Set(),
                        variableDeclarations: new Map(),
                        isWebGL: true,
                }
        if (is.num(x)) return x.toFixed(1)
        if (is.str(x)) return x
        if (!x) return ''

        const type = x.type
        const { id = '', children = [], isVariable, variableName, variableType, isDeclaration } = x.props
        const { isWebGL } = state
        const [a, b, c] = children

        if (type === 'uniform' && id) {
                state.uniforms?.add(id)
                state.onUniform?.(id, x.props.defaultValue)
        }

        if (type === 'variable') {
                // Handle special variable node types for control structures
                if (id === 'assign') {
                        const target = shader(a, state)
                        const value = shader(b, state)

                        if (a && a.props?.isDeclaration) {
                                const varType = inferGLSLType(a.props.variableType || 'float', state)
                                return `${varType} ${target} = ${value};`
                        } else {
                                return `${target} = ${value};`
                        }
                }

                if (id === 'if') {
                        return generateIfCode(children, state)
                }

                if (id === 'elseif') {
                        return generateElseIfCode(children, state)
                }

                if (id === 'else') {
                        return generateElseCode(children, state)
                }

                if (id === 'loop') {
                        return generateLoopCode(children, state)
                }

                if (id === 'function_call') {
                        return generateFunctionCallCode(children, state)
                }

                // Regular variable handling
                const mappedName = isWebGL ? id : VARIABLE_MAPPING[id as keyof typeof VARIABLE_MAPPING] || id
                if (isVariable && variableName) return variableName
                return mappedName
        }

        if (type === 'scope') {
                return generateScopeCode(x as any as ScopeNode, state)
        }

        if (type === 'swizzle') return `${shader(b, state)}.${shader(a, state)}`

        if (type === 'node_type') {
                if (!is.str(a)) throw new Error('Invalid node type')
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

        if (type === 'fragment') {
                const main = generateFragmentMain(shader(a, state), state)
                const uniforms = '' //generateUniforms(state)
                return uniforms + main
        }

        if (type === 'vertex') {
                const main = generateFragmentMain(shader(a, state), state)
                const uniforms = '' //generateUniforms(state)
                return uniforms + main
        }

        return shader(a, state)
}

// Code generation helper functions
const generateScopeCode = (scope: ScopeNode, state: NodeState): string => {
        const lines: string[] = []
        const indent = '    '.repeat(state.indent || 0)

        for (const line of scope.lines) {
                const lineCode = shader(line, {
                        ...state,
                        indent: (state.indent || 0) + 1,
                })
                lines.push(indent + lineCode)
        }

        return lines.join('\n')
}

const generateIfCode = (children: X[], state: NodeState): string => {
        const [condition, ifScope] = children
        const conditionCode = shader(condition, state)
        const indent = '    '.repeat(state.indent || 0)

        const scopeCode = generateScopeCode(ifScope as any as ScopeNode, {
                ...state,
                indent: (state.indent || 0) + 1,
        })

        return `if (${conditionCode}) {\n${scopeCode}\n${indent}}`
}

const generateElseIfCode = (children: X[], state: NodeState): string => {
        const [condition, elseIfScope] = children
        const conditionCode = shader(condition, state)
        const indent = '    '.repeat(state.indent || 0)

        const scopeCode = generateScopeCode(elseIfScope as any as ScopeNode, {
                ...state,
                indent: (state.indent || 0) + 1,
        })

        return ` else if (${conditionCode}) {\n${scopeCode}\n${indent}}`
}

const generateElseCode = (children: X[], state: NodeState): string => {
        const [elseScope] = children
        const indent = '    '.repeat(state.indent || 0)

        const scopeCode = generateScopeCode(elseScope as any as ScopeNode, {
                ...state,
                indent: (state.indent || 0) + 1,
        })

        return ` else {\n${scopeCode}\n${indent}}`
}

const generateLoopCode = (children: X[], state: NodeState): string => {
        const [options, indexVar, loopScope] = children
        const indent = '    '.repeat(state.indent || 0)

        let loopHeader = ''
        if (typeof options === 'object' && options && 'end' in options) {
                const start = options.start ? shader(options.start, state) : '0'
                const end = shader(options.end, state)
                const indexName = shader(indexVar, state)
                loopHeader = `for (int ${indexName} = ${start}; ${indexName} < ${end}; ${indexName}++)`
        } else {
                const count = shader(options, state)
                const indexName = shader(indexVar, state)
                loopHeader = `for (int ${indexName} = 0; ${indexName} < ${count}; ${indexName}++)`
        }

        const scopeCode = generateScopeCode(loopScope as any as ScopeNode, {
                ...state,
                indent: (state.indent || 0) + 1,
        })

        return `${loopHeader} {\n${scopeCode}\n${indent}}`
}

const generateFunctionCallCode = (children: X[], state: NodeState): string => {
        const [fnScope, result, ...args] = children

        // For now, inline the function body
        const scopeCode = generateScopeCode(fnScope as any as ScopeNode, state)
        const resultCode = shader(result, state)

        return `({\n${scopeCode}\n    ${resultCode};\n})`
}
