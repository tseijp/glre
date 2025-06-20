import { is } from '../utils/helpers'
import { OPERATORS, VARIABLE_MAPPING } from './const'
import { type NodeState, type X } from './types'
import { generateFragmentMain, generateUniforms, joins } from './utils'

export const shader = (x: X, state?: NodeState | null): string => {
        if (!state) state = { lines: [], variables: new Map(), indent: 0, uniforms: new Set() }
        if (is.num(x)) return x.toFixed(1)
        if (is.str(x)) return x
        if (!x) return ''

        const type = x.type
        const { id = '', children = [], isVariable, variableName } = x.props
        const { isWebGL } = state
        const [a, b, c] = children

        // uniform 使用追跡
        if (type === 'uniform' && id) {
                state.uniforms?.add(id)
                state.onUniform?.(id, x.props.defaultValue)
        }

        // 変数名マッピング
        if (type === 'variable') {
                const mappedName = isWebGL ? id : VARIABLE_MAPPING[id as keyof typeof VARIABLE_MAPPING] || id
                if (isVariable && variableName) return variableName
                return mappedName
        }

        if (type === 'assign') {
                const target = shader(a, state)
                const value = shader(b, state)
                const line = `${target} = ${value};`
                state.lines?.push(line)
                return target
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

        if (type === 'if') {
                const condition = shader(a, state)
                const thenBlock = x.props.onCondition
                state.lines?.push(`if (${condition}) {`)
                if (thenBlock) thenBlock()
                return ''
        }

        if (type === 'loop') {
                const count = shader(a, state)
                const loopVar = shader(b, state)
                const callback = x.props.onLoop
                state.lines?.push(`for (int ${loopVar} = 0; ${loopVar} < ${count}; ${loopVar}++) {`)
                if (callback) callback({ i: b })
                return ''
        }

        if (type === 'fragment') {
                const main = generateFragmentMain(shader(a, state), state)
                const uniforms = generateUniforms(state)
                return uniforms + main
        }

        if (type === 'vertex') {
                const main = generateFragmentMain(shader(a, state), state)
                const uniforms = generateUniforms(state)
                return uniforms + main
        }

        return shader(a, state)
}

/**
const generateVariable = (id: string, value: X, state: NodeState): string => {
        if (!state.variables) state.variables = new Map()
        if (!state.lines) state.lines = []

        const valueStr = shader(value, state)
        const varType = inferType(value)
        const mappedType = state.isWebGL ? varType : TYPE_MAPPING[varType as keyof typeof TYPE_MAPPING] || varType

        const declaration = state.isWebGL
                ? `${mappedType} ${id} = ${valueStr};`
                : `var ${id}: ${mappedType} = ${valueStr};`

        state.lines.push(declaration)
        state.variables.set(id, mappedType)
        return id
}

const inferType = (x: X): string => {
        if (is.num(x)) return 'float'
        if (!isProxy(x)) throw ``
        if (!x || !x.props || !x.props.children) return 'float'

        const [first] = x.props.children
        if (is.str(first)) {
                if (
                        first.startsWith('vec') ||
                        first.startsWith('mat') ||
                        first.startsWith('ivec') ||
                        first.startsWith('uvec') ||
                        first.startsWith('bvec')
                ) {
                        return first
                }
        }
        return 'float'
} */
