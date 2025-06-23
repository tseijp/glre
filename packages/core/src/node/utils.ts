import { is } from '../utils/helpers'
import { code } from './code'
import { CONVERSIONS, FUNCTIONS, OPERATOR_KEYS, OPERATORS } from './const'
import type { Conversions, Functions, NodeConfig, Operators, Swizzles, X } from './types'

export const isSwizzle = (key: unknown): key is Swizzles => {
        return is.str(key) && /^[xyzwrgbastpq]{1,4}$/.test(key)
}

export const isOperator = (key: unknown): key is Operators => {
        return OPERATOR_KEYS.includes(key as Operators)
}

export const isFunction = (key: unknown): key is Functions => {
        return FUNCTIONS.includes(key as Functions)
}

export const isConversion = (key: unknown): key is Conversions => {
        return CONVERSIONS.includes(key as Conversions)
}

let count = 0

export const hex2rgb = (hex: number) => {
        const r = ((hex >> 16) & 0xff) / 255
        const g = ((hex >> 8) & 0xff) / 255
        const b = (hex & 0xff) / 255
        return [r, g, b]
}

export const getId = () => `i${count++}`

export const joins = (children: X[], c: NodeConfig) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => code(x, c))
                .join(', ')
}

// WebGPU type formatting utility
export const formatConversions = (x: X, c?: NodeConfig): string => {
        if (!is.str(x)) return ''
        if (!c?.isWebGL && x.startsWith('vec')) {
                return `${x}f`
        }
        return x
}

// Operator mapping utility
export const getOperator = (op: X) => {
        return OPERATORS[op as keyof typeof OPERATORS] || op
}

export const inferType = (target: X, c: NodeConfig): string => {
        if (!target || typeof target !== 'object' || typeof target === 'boolean') return 'float'
        if (!('type' in target) || !('props' in target)) return 'float'

        const { type, props } = target
        const { children = [] } = props
        const [x, y, z] = children

        if (type === 'conversions') return x as string
        if (type === 'uniform') {
                const defaultValue = props.defaultValue
                if (typeof defaultValue === 'boolean') return 'bool'
                if (typeof defaultValue === 'number') return 'float'
                if (Array.isArray(defaultValue)) {
                        if (defaultValue.length === 2) return 'vec2'
                        if (defaultValue.length === 3) return 'vec3'
                        if (defaultValue.length === 4) return 'vec4'
                }
                return 'float'
        }
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
        if (type === 'attribute') return 'vec3'
        if (type === 'varying') return 'vec3'
        if (type === 'builtin') return 'vec4'

        return 'float'
}

const generateUniforms = (c: NodeConfig): string => {
        if (!c.uniforms || c.uniforms.size === 0) return ''
        const uniformList = Array.from(c.uniforms)
        return uniformList
                .map((uniform, i) => {
                        if (c.isWebGL) return `uniform ${uniform};`
                        else return `@group(0) @binding(${i}) var<uniform> ${uniform};`
                })
                .join('\n')
}

const generateFragmentMain = (body: string, uniforms: string, isWebGL = true) => {
        if (isWebGL)
                return `
#version 300 es
precision mediump float;
${uniforms}
out vec4 fragColor;
void main() {
fragColor = ${body};
}`.trim()
        return `
${uniforms}
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
return ${body};
}`.trim()
}

export const fragment = (x: X, c: NodeConfig) => {
        const body = code(x, c)
        const uniforms = generateUniforms(c)
        return generateFragmentMain(body, uniforms, c.isWebGL)
}

export const vertex = (x: X, c: NodeConfig) => {
        const body = code(x, c)
        const uniforms = generateUniforms(c)
        return generateFragmentMain(body, uniforms, c.isWebGL)
}
