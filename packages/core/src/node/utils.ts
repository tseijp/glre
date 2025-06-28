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
import type {
        Constants,
        Conversions,
        Functions,
        NodeContext,
        NodeProps,
        NodeProxy,
        Operators,
        Swizzles,
        X,
} from './types'

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
        if (typeof x !== 'object') return false
        return (x as any).isProxy
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

export const generateDefine = (props: NodeProps, c: NodeContext) => {
        const { id, children = [], layout } = props
        const [x, y, ...args] = children
        const returnType = layout?.type && layout?.type !== 'auto' ? layout?.type : y ? infer(y, c) : 'void'
        const argParams: [name: string, type: string][] = []
        const params: string[] = []
        if (layout?.inputs)
                for (const input of layout.inputs) {
                        argParams.push([input.name, input.type])
                }
        else
                for (let i = 0; i < args.length; i++) {
                        argParams.push([`p${i}`, infer(args[i], c)])
                }
        let ret = ''
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

const generateFragmentMain = (body: string, head: string, isWebGL = true) => {
        const ret = [] as string[]
        if (isWebGL) {
                ret.push('#version 300 es\nprecision mediump float;\nout vec4 fragColor;')
                ret.push(head)
                ret.push(`void main() {\n  fragColor = ${body};`)
        } else {
                ret.push(head)
                ret.push('@fragment')
                ret.push('fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {') // @TODO FIX
                ret.push(`  return ${body};`)
        }
        ret.push('}')
        return ret.filter(Boolean).join('\n')
}

const generateVertexInputs = (c?: NodeContext) => {
        if (!c?.attributes?.size) return ''
        const inputs = []
        for (const [name, location] of c.attributes.entries()) {
                const format = 'vec2f' // @TODO FIX
                inputs.push(`@location(${location}) ${name}: ${format}`)
        }
        return inputs.join(',\n  ')
}

const generateVertexMain = (body: string, head: string, isWebGL = true, c?: NodeContext) => {
        const ret = []
        if (isWebGL) {
                ret.push('#version 300 es')
                ret.push(head)
        } else {
                ret.push('@vertex')
                ret.push(head)
                ret.push('fn main(')
                ret.push(generateVertexInputs(c))
                ret.push(') -> @builtin(position) vec4f {')
                ret.push(`  ${body}`)
        }
        ret.push('}')
        return ret.filter(Boolean).join('\n')
}

export const fragment = (x: X, c: NodeContext = {}) => {
        const body = code(x, c)
        const head = generateHead(c)
        const main = generateFragmentMain(body, head, c.isWebGL)
        return main
}

export const vertex = (x: X, c: NodeContext) => {
        const body = code(x, c)
        const head = generateHead(c)
        const main = generateVertexMain(body, head, c.isWebGL, c)
        return main
}
