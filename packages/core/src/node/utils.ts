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
        const { id, children = [], layout } = props
        const [x, y, ...args] = children
        const returnType = layout?.type || (y ? infer(y, c) : 'void')
        const argParams: [name: string, type: string][] = []
        if (layout?.inputs)
                for (const input of layout.inputs) {
                        argParams.push([input.name, input.type])
                }
        else
                for (let i = 0; i < args.length; i++) {
                        argParams.push([`p${i}`, infer(args[i], c)])
                }
        let ret = ''
        const params: string[] = []
        if (c?.isWebGL) {
                for (const [id, type] of argParams) params.push(`${type} ${id}`)
                ret += `${returnType} ${id}(${params}) {\n`
        } else {
                for (const [id, type] of argParams) params.push(`${id}: ${formatConversions(type, c)}`)
                ret += `fn ${id}(${params}) -> ${formatConversions(returnType, c)} {\n`
        }
        const scopeCode = code(x, c)
        if (scopeCode) ret += scopeCode + '\n'
        if (y) ret += `return ${code(y, c)};`
        ret += '\n}'
        return ret
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

const generateFragmentMain = (body: string, head: string, isWebGL = true) => {
        let ret = ''
        if (isWebGL) ret += GLSL_FRAGMENT_HEAD
        if (head) ret += head + '\n'
        if (isWebGL) ret += `void main() {\n  fragColor = ${body};`
        else {
                ret += WGSL_FRAGMENT_HEAD + '\n'
                ret += `  return ${body};`
        }
        ret += '\n}'
        return ret
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
