import { code } from './code'
import { infer } from '../infer'
import { isNodeProxy } from '../utils'
import type { NodeContext } from '../types'

const GLSL_FRAGMENT_HEAD = `
#version 300 es
precision mediump float;
out vec4 fragColor;
`.trim()

const WGSL_FRAGMENT_HEAD = `
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
`.trim()

export const fragmentMain = (head: string, body: string, c: NodeContext) => {
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

export const vertexMain = (head: string, body: string, c: NodeContext) => {
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
