import { NodeProps } from './../../../../node_modules/glre/src/node/types'
import { is } from '../utils/helpers'
import { code } from './code'
import { CONVERSIONS, FUNCTIONS, OPERATOR_KEYS, OPERATORS, TYPE_MAPPING } from './const'
import type { Conversions, Functions, NodeConfig, NodeProxy, Operators, Swizzles, X } from './types'
import { infer } from './infer'

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

export const isNodeProxy = (x: unknown): x is NodeProxy => {
        if (!x) return false
        if (typeof x !== 'object') return false // @ts-ignore
        return x.isProxy
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

export const formatConversions = (x: X, c?: NodeConfig) => {
        if (!is.str(x)) return ''
        if (c?.isWebGL) return x
        return TYPE_MAPPING[x as keyof typeof TYPE_MAPPING]
}

export const getOperator = (op: X) => {
        return OPERATORS[op as keyof typeof OPERATORS] || op
}

const generateHead = (c: NodeConfig) => {
        return Array.from(c.headers!)
                .map(([, v]) => v)
                .join('\n')
}

export const generateDefine = (props: NodeProps, c: NodeConfig) => {
        const { id, children = [] } = props
        const [x, y, ...args] = children
        const returnType = y ? infer(y, c) : 'void'
        const params = args.map((arg, i) => [`p${i}`, infer(arg, c)])
        const lines = [code(x, c)]
        if (y) lines.push(`return ${code(y, c)};`)
        if (c?.isWebGL) {
                const paramList = params.map(([name, type]) => `${type} ${name}`)
                return `${returnType} ${id}(${paramList}) {\n${lines.join('\n')}\n}`
        }
        const wgslReturnType = formatConversions(returnType, c)
        const wgslParams = params.map(([name, type]) => `${name}: ${formatConversions(type, c)}`)
        return `fn ${id}(${wgslParams}) -> ${wgslReturnType} {\n${lines.join('\n')}\n}`
}

const generateFragmentMain = (body: string, head: string, isWebGL = true) => {
        if (isWebGL)
                return `
#version 300 es
precision mediump float;
out vec4 fragColor;
${head}
void main() {
fragColor = ${body};
}`.trim()
        return `
${head}
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
return ${body};
}`.trim()
}

export const fragment = (x: X, c: NodeConfig = {}) => {
        const body = code(x, c)
        const head = generateHead(c)
        const main = generateFragmentMain(body, head, c.isWebGL)
        console.log(`// ↓↓↓ generated ↓↓↓\n\n${main}\n\n`)
        return main
}

export const vertex = (x: X, c: NodeConfig) => {
        const body = code(x, c)
        const head = generateHead(c)
        return generateFragmentMain(body, head, c.isWebGL)
}
