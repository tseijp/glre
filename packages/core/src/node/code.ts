import { is } from '../utils/helpers'
import { OPERATORS, VARIABLE_MAPPING } from './const'
import { generateFragmentMain, joins } from './utils'
import type { NodeState, X } from './types'

export const shader = (x: X, state?: NodeState | null): string => {
        if (!state) state = { lines: [], variables: new Map(), indent: 0, uniforms: new Set() }
        if (is.num(x)) return x.toFixed(1)
        if (is.str(x)) return x
        if (!x) return ''

        const type = x.type
        const { id = '', children = [], isVariable, variableName } = x.props
        const { isWebGL } = state
        const [a, b, c] = children

        if (type === 'uniform' && id) {
                state.uniforms?.add(id)
                state.onUniform?.(id, x.props.defaultValue)
        }

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

        if (type === 'fragment') {
                const main = generateFragmentMain(shader(a, state))
                const uniforms = '' //generateUniforms(state)
                return uniforms + main
        }

        if (type === 'vertex') {
                const main = generateFragmentMain(shader(a, state))
                const uniforms = '' //generateUniforms(state)
                return uniforms + main
        }

        return shader(a, state)
}
