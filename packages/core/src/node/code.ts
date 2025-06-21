import { is } from '../utils/helpers'
import { OPERATORS, WGSL_TYPE_MAPPING } from './const'
import { inferType, joins } from './utils'
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
                return id
        }

        if (type === 'variable') {
                return id || 'undefined'
        }

        if (type === 'swizzle') return `${shader(b, state)}.${shader(a, state)}`

        if (type === 'node_type') {
                if (!is.str(a)) throw new Error('Invalid node type')
                const func = !isWebGL && a.startsWith('vec') ? `${a}f` : a
                const args = joins(children.slice(1), state)
                return `${func}(${args})`
        }

        if (type === 'operator') {
                if (a === 'not' || a === 'bitNot') return `!${shader(b, state)}`
                const op = OPERATORS[a as keyof typeof OPERATORS]
                return `(${shader(b, state)} ${op} ${shader(c, state)})`
        }

        if (type === 'function') {
                const funcName = a
                const args = joins(children.slice(1), state)
                return `${funcName}(${args})`
        }

        if (type === 'declare') {
                const [varNode, valueNode] = children
                const varType = inferType(valueNode, state)
                const varName = (varNode as any)?.props?.id || 'var'
                const typeStr = isWebGL
                        ? varType
                        : WGSL_TYPE_MAPPING[varType as keyof typeof WGSL_TYPE_MAPPING] || varType
                const prefix = isWebGL ? '' : 'var '
                return `${prefix}${typeStr} ${varName} = ${shader(valueNode, state)};`
        }

        if (type === 'assign') {
                const [target, value] = children
                return `${shader(target, state)} = ${shader(value, state)};`
        }

        if (type === 'scope') {
                return children.map((child) => shader(child, state)).join('\n')
        }

        if (type === 'fn') {
                const [scope, result] = children
                let code = shader(scope, state)
                if (result) {
                        code += (code ? '\n' : '') + `return ${shader(result, state)};`
                }
                return code
        }

        if (type === 'if') {
                let code = `if (${shader(children[0], state)}) {\n${shader(children[1], state)}\n}`
                for (let i = 2; i < children.length; i += 2) {
                        if (i + 1 < children.length)
                                code += ` else if (${shader(children[i], state)}) {\n${shader(
                                        children[i + 1],
                                        state
                                )}\n}`
                        else code += ` else {\n${shader(children[i], state)}\n}`
                }
                return code
        }

        if (type === 'loop') {
                const [config, scope] = children
                const condition = is.num(config) ? `i < ${config}` : shader(config, state)
                const init = is.num(config) ? 'int i = 0' : ''
                const update = is.num(config) ? 'i++' : ''

                if (is.num(config)) {
                        return `for (${init}; ${condition}; ${update}) {\n${shader(scope, state)}\n}`
                } else return `while (${condition}) {\n${shader(scope, state)}\n}`
        }

        if (type === 'fragment') {
                const body = shader(a, state)
                const uniforms = generateUniforms(state)
                return generateFragmentMain(body, uniforms, isWebGL)
        }

        return shader(a, state)
}

const generateUniforms = (state: NodeState): string => {
        if (!state.uniforms || state.uniforms.size === 0) return ''

        const uniformList = Array.from(state.uniforms)
        return (
                uniformList
                        .map((name) => {
                                if (state.isWebGL) {
                                        return `uniform vec2 ${name};`
                                } else {
                                        return `@group(0) @binding(0) var<uniform> ${name}: vec2f;`
                                }
                        })
                        .join('\n') + '\n'
        )
}

const generateFragmentMain = (body: string, uniforms: string, isWebGL = true): string => {
        if (isWebGL) {
                return `
${uniforms}
#version 300 es
precision mediump float;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
void main() {
${body}
}`.trim()
        } else {
                return `
${uniforms}
@fragment
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(0) @binding(1) var<uniform> iMouse: vec2f;
@group(0) @binding(2) var<uniform> iTime: f32;
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
${body}
}`.trim()
        }
}
