import { is } from '../utils/helpers'
import { code } from './code'
import { infer } from './infer'
import { CONVERSIONS, FUNCTIONS, OPERATOR_KEYS, OPERATORS, TYPE_MAPPING, WGSL_TO_GLSL_BUILTIN } from './const'
import type { Conversions, Functions, NodeConfig, NodeProps, NodeProxy, Operators, Swizzles, X } from './types'

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

export const hex2rgb = (hex: number) => {
        const r = ((hex >> 16) & 0xff) / 255
        const g = ((hex >> 8) & 0xff) / 255
        const b = (hex & 0xff) / 255
        return [r, g, b]
}

let count = 0

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

export const getBluiltin = (id: string) => {
        return WGSL_TO_GLSL_BUILTIN[id as keyof typeof WGSL_TO_GLSL_BUILTIN]
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
        let ret = ''
        if (c?.isWebGL) {
                const paramList = params.map(([name, type]) => `${type} ${name}`)
                ret += `${returnType} ${id}(${paramList}) {\n`
        } else {
                const wgslReturnType = formatConversions(returnType, c)
                const wgslParams = params.map(([name, type]) => `${name}: ${formatConversions(type, c)}`)
                ret += `fn ${id}(${wgslParams}) -> ${wgslReturnType} {\n`
        }
        const scopeCode = code(x, c)
        if (scopeCode) ret += scopeCode + '\n'
        if (y) ret += `return ${code(y, c)};`
        ret += '\n}'
        return ret
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

const generateVertexMain = (body: string, head: string, isWebGL = true) => {
        // @TODO FIX
        if (isWebGL) return ``
        return ``
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
        return generateVertexMain(body, head, c.isWebGL)
}
