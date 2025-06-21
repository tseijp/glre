import { is } from '../utils/helpers'
import { OPERATORS } from './const'
import { generateFragmentMain, joins } from './utils'
import type { NodeState, X } from './types'

export const shader = (x: X, state?: NodeState | null): string => {
        if (!state) state = { uniforms: new Set() }
        if (is.num(x)) return x.toFixed(1)
        if (is.str(x)) return x
        if (!x) return ''

        const type = x.type
        const { id = '', children = [] } = x.props
        const { isWebGL } = state
        const [a, b, c] = children

        if (type === 'uniform' && id) {
                state.uniforms?.add(id)
                state.onUniform?.(id, x.props.defaultValue)
        }

        if (type === 'variable') {
                // @TODO FIX
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

        return shader(a, state)
}
