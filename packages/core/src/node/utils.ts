import { is } from '../utils/helpers'
import { shader } from './code'
import { NodeState, X } from './types'

export const joins = (children: X[], state: NodeState) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => shader(x, state))
                .join(', ')
}

export const generateUniforms = (state: NodeState): string => {
        if (!state.uniforms?.size) return ''

        const lines: string[] = []
        let binding = 0

        for (const name of ['iResolution', 'iMouse', 'iTime']) {
                if (state.uniforms.has(name)) {
                        const type = name === 'iResolution' || name === 'iMouse' ? 'vec2f' : 'f32'
                        if (state.isWebGL) lines.push(`uniform ${type.replace('f', '')} ${name};`)
                        else lines.push(`@group(0) @binding(${binding}) var<uniform> ${name}: ${type};`)
                        binding++
                }
        }

        return lines.join('\\n') + (lines.length ? '\\n\\n' : '')
}

export const generateFragmentMain = (body: string, state: NodeState): string => {
        const lines = state.lines || []
        const bodyLines = lines.length ? lines.join('\\n') + '\\n' : ''

        if (state.isWebGL)
                return `
void main() {
        ${bodyLines}gl_FragColor = ${body};
}`.trim()
        else
                return `
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
        ${bodyLines}  return ${body};
}`.trim()
}
