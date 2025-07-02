import { is } from '../utils/helpers'
import { code } from './code'
import { infer } from './infer'
import {
        CONSTANTS,
        CONVERSIONS,
        FUNCTIONS,
        OPERATOR_KEYS,
        OPERATORS,
        TYPE_MAPPING,
        WGSL_TO_GLSL_BUILTIN,
} from './const'
import type { Constants, Conversions, Functions, NodeContext, NodeProxy, Operators, Swizzles, X } from './types'

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

export const isConstantsType = (type?: Constants | 'auto'): type is Constants => {
        if (!type) return false
        if (type === 'auto') return false
        return true
}

export const hex2rgb = (hex: number) => {
        const r = ((hex >> 16) & 0xff) / 255
        const g = ((hex >> 8) & 0xff) / 255
        const b = (hex & 0xff) / 255
        return [r, g, b]
}

let count = 0

export const getId = () => `i${count++}`

export const joins = (children: X[], c: NodeContext) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => code(x, c))
                .join(', ')
}

export const formatConversions = (x: X, c?: NodeContext) => {
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

export const conversionToConstant = (conversionKey: string): Constants => {
        const index = CONVERSIONS.indexOf(conversionKey as Conversions)
        return index !== -1 ? CONSTANTS[index] : 'float'
}

const generateHead = (c: NodeContext) => {
        return Array.from(c.headers!)
                .map(([, v]) => v)
                .join('\n')
}

const GLSL_FRAGMENT_HEAD = `
#version 300 es
precision mediump float;
out vec4 fragColor;
`.trim()

const WGSL_FRAGMENT_HEAD = `
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
`.trim()

const generateFragmentMain = (body: string, head: string, c: NodeContext) => {
        let ret = ''
        if (c.isWebGL) {
                ret += GLSL_FRAGMENT_HEAD
                if (c.vertexOutput && c.vertexOutput.props.structNode) {
                        const structNode = c.vertexOutput.props.structNode
                        const fields = structNode.props.fields || {}
                        for (const key in fields) {
                                if (isNodeProxy(fields[key]) && fields[key].type !== 'builtin') {
                                        const fieldType = infer(fields[key], c)
                                        ret += `\nin ${fieldType} varying_${key};`
                                }
                        }
                }
        }
        if (head) ret += '\n' + head + '\n'
        if (c.isWebGL) {
                ret += `void main() {\n`
                if (c.vertexOutput && c.vertexOutput.props.structNode) c.isVarying = true
                ret += `  fragColor = ${body};`
        } else {
                if (c.vertexOutput && c.vertexOutput.props.structNode) {
                        const structType = code(c.vertexOutput.props.structNode, c)
                        ret += `@fragment\nfn main(input: ${structType}) -> @location(0) vec4f {\n`
                } else ret += WGSL_FRAGMENT_HEAD + '\n'
                ret += `  return ${body};`
        }
        ret += '\n}'
        return ret
}

const generateVertexMain = (body: string, head: string, c: NodeContext) => {
        const ret = []
        const returnType = c.vertexOutput ? 'struct' : 'vec4'
        if (c.isWebGL) {
                ret.push('#version 300 es')
                if (c.vertexOutput && c.vertexOutput.props.structNode) {
                        const structNode = c.vertexOutput.props.structNode
                        const fields = structNode.props.fields || {}
                        for (const key in fields) {
                                if (isNodeProxy(fields[key]) && fields[key].type !== 'builtin') {
                                        const fieldType = infer(fields[key], c)
                                        ret.push(`out ${fieldType} varying_${key};`)
                                }
                        }
                }
                ret.push(head)
                ret.push('void main() {')
                if (returnType === 'struct') {
                        const structVar = `${c.vertexOutput!.props.id}`
                        ret.push(`${code(c.vertexOutput!.props.structNode, c)} ${structVar} = ${body};`)
                        ret.push(`gl_Position = ${structVar}.position;`)
                        const structNode = c.vertexOutput!.props.structNode
                        const fields = structNode?.props.fields || {}
                        for (const key in fields) {
                                if (isNodeProxy(fields[key]) && fields[key].type !== 'builtin')
                                        ret.push(`varying_${key} = ${structVar}.${key};`)
                        }
                } else {
                        ret.push(`gl_Position = ${body};`)
                }
        } else {
                ret.push(head)
                ret.push('@vertex')
                if (c.arguments && c.arguments.size > 0) {
                        const inputs = Array.from(c.arguments.values())
                        if (returnType === 'struct') {
                                const structType = code(c.vertexOutput!.props.structNode, c)
                                ret.push(`fn main(${inputs.join(', ')}) -> ${structType} {`)
                        } else ret.push(`fn main(${inputs.join(', ')}) -> @builtin(position) vec4f {`)
                } else {
                        if (returnType === 'struct') {
                                const structType = code(c.vertexOutput!.props.structNode, c)
                                ret.push(`fn main() -> ${structType} {`)
                        } else ret.push('fn main() -> @builtin(position) vec4f {')
                }
                ret.push(`  return ${body};`)
        }
        ret.push('}')
        return ret.filter(Boolean).join('\n')
}

export const fragment = (x: NodeProxy, c: NodeContext = {}) => {
        const body = code(x, c)
        const head = generateHead(c)
        const main = generateFragmentMain(body, head, c)
        console.log(`// ↓↓↓ generated ↓↓↓\n\n${main}\n\n`)
        return main
}

export const vertex = (x: NodeProxy, c: NodeContext) => {
        if (x.type === 'variable' && x.props.structNode) c.vertexOutput = x
        const body = code(x, c)
        const head = generateHead(c)
        const main = generateVertexMain(body, head, c)
        console.log(`// ↓↓↓ generated ↓↓↓\n\n${main}\n\n`)
        return main
}
