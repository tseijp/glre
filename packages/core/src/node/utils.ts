import { is } from '../utils/helpers'
import { code } from './code'
import { FUNCTIONS, NODE_TYPES, OPERATOR_KEYS } from './const'
import type { Functions, NodeConfig, NodeType, Operators, Swizzles, X } from './types'

export const isSwizzle = (key: unknown): key is Swizzles => {
        return is.str(key) && /^[xyzwrgbastpq]{1,4}$/.test(key)
}

export const isOperator = (key: unknown): key is Operators => {
        return OPERATOR_KEYS.includes(key as Operators)
}

export const isNodeType = (key: unknown): key is NodeType => {
        return NODE_TYPES.includes(key as NodeType)
}

export const isFunction = (key: unknown): key is Functions => {
        return FUNCTIONS.includes(key as Functions)
}

let count = 0

export const getId = () => `i${count++}`

export const joins = (children: X[], c: NodeConfig) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => code(x, c))
                .join(', ')
}

export const inferType = (target: X, c: NodeConfig): string => {
        if (!target || typeof target !== 'object') return 'float'
        const { type, props } = target
        const { children = [] } = props
        const [x, y, z] = children
        if (type === 'node_type') return x as string
        if (type === 'operator') {
                const left = inferType(y, c)
                const right = inferType(z, c)
                if (left === right) return left
                if (left.includes('vec')) return left
                if (right.includes('vec')) return right
                return 'float'
        }
        if (type === 'math_fun') {
                if (['normalize', 'cross', 'reflect'].includes(x as string)) return inferType(children[1], c)
                if (['dot', 'distance', 'length'].includes(x as string)) return 'float'
                return 'float'
        }
        return 'float'
}

export const generateUniforms = (c: NodeConfig): string => {
        if (!c.uniforms || c.uniforms.size === 0) return ''
        const uniformList = Array.from(c.uniforms)
        return (
                uniformList
                        .map((name, i) => {
                                if (c.isWebGL) return `uniform vec2 ${name};`
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
