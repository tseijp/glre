import { is } from '../utils/helpers'
import { code } from './code'
import type { NodeConfig, X } from './types'

export const joins = (children: X[], state: NodeConfig) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => code(x, state))
                .join(', ')
}

export const inferType = (target: X, state: NodeConfig): string => {
        if (!target || typeof target !== 'object') return 'float'
        const { type, props } = target
        const { children = [] } = props
        const [x, y, z] = children
        if (type === 'node_type') return x as string
        if (type === 'operator') {
                const left = inferType(y, state)
                const right = inferType(z, state)
                if (left === right) return left
                if (left.includes('vec')) return left
                if (right.includes('vec')) return right
                return 'float'
        }
        if (type === 'function') {
                if (['normalize', 'cross', 'reflect'].includes(x as string)) return inferType(children[1], state)
                if (['dot', 'distance', 'length'].includes(x as string)) return 'float'
                return 'float'
        }
        return 'float'
}

export const generateUniforms = (state: NodeConfig): string => {
        if (!state.uniforms || state.uniforms.size === 0) return ''
        const uniformList = Array.from(state.uniforms)
        return (
                uniformList
                        .map((name, i) => {
                                if (state.isWebGL) return `uniform vec2 ${name};`
                                else return `@group(0) @binding(${i}) var<uniform> ${name}: vec2f;`
                        })
                        .join('\n') + '\n'
        )
}

export const generateFragmentMain = (body: string, uniforms: string, isWebGL = true) => {
        if (isWebGL)
                return `
${uniforms}
#version 300 es
precision mediump float;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
out vec4 fragColor;
void main() {
${body}
}`.trim()
        return `
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(0) @binding(1) var<uniform> iMouse: vec2f;
@group(0) @binding(2) var<uniform> iTime: f32;
${uniforms}
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
${body}
}`.trim()
}
