import { is } from '../utils/helpers'
import { infer } from './infer'
import { getBluiltin, getOperator, formatConversions, joins, isNodeProxy, getId } from './utils'
import type { Constants, NodeContext, NodeProps, X } from './types'

const codeUniformHead = (c: NodeContext, id: string, varType: Constants) => {
        if (varType === 'sampler2D' || varType === 'texture') {
                if (c.isWebGL) return `uniform sampler2D ${id};`
                const { group = 1, binding = 0 } = c.webgpu?.textures.map.get(id) || {}
                return (
                        `@group(${group}) @binding(${binding}) var ${id}Sampler: sampler;\n` +
                        `@group(${group}) @binding(${binding + 1}) var ${id}: texture_2d<f32>;`
                )
        }
        if (c.isWebGL) return `uniform ${varType} ${id};`
        const { group = 0, binding = 0 } = c.webgpu?.uniforms.map.get(id) || {}
        const wgslType = formatConversions(varType, c)
        return `@group(${group}) @binding(${binding}) var<uniform> ${id}: ${wgslType};`
}

const codeConstantHead = (c: NodeContext, id: string, varType: Constants, value: string) => {
        return c.isWebGL
                ? `const ${varType} ${id} = ${value};`
                : `const ${id}: ${formatConversions(varType, c)} = ${value};`
}

const codeAttribHead = (c: NodeContext, id: string, varType: Constants) => {
        if (c.isWebGL) return `in ${varType} ${id};`
        const { location = 0 } = c.webgpu?.attribs.map.get(id) || {}
        const wgslType = formatConversions(varType, c)
        return `@location(${location}) ${id}: ${wgslType}`
}

const codeStructHead = (c: NodeContext, id: string, fields: Record<string, X>) => {
        let ret = ''
        if (c.isWebGL) {
                ret = `struct ${id} {\n`
                for (const key in fields) {
                        const fieldType = infer(fields[key], c)
                        ret += `  ${fieldType} ${key};\n`
                }
                ret += '};'
        } else {
                ret = `struct ${id} {\n`
                let location = 0
                for (const key in fields) {
                        const field = fields[key]
                        const fieldType = infer(field, c)
                        if (isNodeProxy(field) && field.type === 'builtin') {
                                ret += `  @builtin(${field.props.id}) ${key}: ${formatConversions(fieldType, c)},\n`
                        } else {
                                ret += `  @location(${location}) ${key}: ${formatConversions(fieldType, c)},\n`
                                location++
                        }
                }
                ret += '}'
        }
        return ret
}

export const code = (target: X, c?: NodeContext | null): string => {
        if (!c) c = {}
        if (!c.headers) c.headers = new Map()
        if (!c.arguments) c.arguments = new Map()
        if (is.str(target)) return target
        if (is.num(target)) {
                const ret = `${target}`
                if (ret.includes('.')) return ret
                return ret + '.0'
        }
        if (is.bol(target)) return target ? 'true' : 'false'
        if (!target) return ''
        const { type, props } = target
        const { id = '', children = [] } = props
        const [x, y, z, w] = children
        /**
         * headers
         */
        if (c.headers.has(id)) return id
        let head = ''
        if (type === 'uniform') head = codeUniformHead(c, id, infer(target, c))
        if (type === 'constant') head = codeConstantHead(c, id, infer(target, c), code(x, c))
        if (type === 'attribute') {
                const varType = infer(target, c)
                head = codeAttribHead(c, id, varType)
                if (!c.isWebGL) {
                        c.arguments.set(id, head)
                        return id
                }
        }
        if (head) {
                c.headers.set(id, head)
                return id
        }
        /**
         * struct
         */
        if (type === 'struct') {
                const structId = `Struct_${id}`
                if (!c.headers.has(structId)) {
                        const head = codeStructHead(c, structId, props.fields!)
                        c.headers.set(structId, head)
                }
                return structId
        }
        if (type === 'dynamic') {
                if (c.isWebGL && c.isVarying) return props.field || ''
                return `${code(x, c)}.${props.field || ''}`
        }
        /**
         * variables
         */
        if (type === 'variable') return id
        if (type === 'swizzle') return `${code(y, c)}.${code(x, c)}`
        if (type === 'ternary') return `(${code(x, c)} ? ${code(y, c)} : ${code(z, c)})`
        if (type === 'builtin') return c?.isWebGL ? getBluiltin(id) : id
        if (type === 'conversion') return `${formatConversions(x, c)}(${joins(children.slice(1), c)})`
        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                return `(${code(y, c)} ${getOperator(x)} ${code(z, c)})`
        }
        if (type === 'function') {
                if (x === 'negate') return `(-${joins(children.slice(1), c)})`
                if (x === 'texture') return codeTexture(c, y, z, w)
                return `${x}(${joins(children.slice(1), c)})`
        }
        /**
         * scopes
         */
        if (type === 'scope') return children.map((child: any) => code(child, c)).join('\n')
        if (type === 'assign') return `${code(x, c)} = ${code(y, c)};`
        if (type === 'return') return `return ${code(x, c)};`
        if (type === 'loop')
                return c.isWebGL
                        ? `for (int i = 0; i < ${x}; i += 1) {\n${code(y, c)}\n}`
                        : `for (var i: i32 = 0; i < ${x}; i++) {\n${code(y, c)}\n}`
        if (type === 'if') return codeIf(c, x, y, children)
        if (type === 'switch') return codeSwitch(c, x, children)
        if (type === 'declare') return codeDeclare(c, x, y)
        if (type === 'define') {
                const returnType = infer(target, c)
                const args = children.slice(1)
                const ret = `${id}(${joins(args, c)})`
                if (c.headers.has(id)) return ret
                c.headers.set(id, codeDefine(c, props, returnType))
                return ret
        }
        return code(x, c)
}

const codeTexture = (c: NodeContext, y: X, z: X, w: X) => {
        if (c.isWebGL) {
                const args = w ? [y, z, w] : [y, z]
                return `texture(${joins(args, c)})`
        }
        const _y = code(y, c)
        const args = [_y, _y + 'Sampler', code(z, c)]
        if (!w) return `textureSample(${args})`
        args.push(code(w, c))
        return `textureSampleLevel(${args})`
}

const codeIf = (c: NodeContext, x: X, y: X, children: X[]) => {
        let ret = `if (${code(x, c)}) {\n${code(y, c)}\n}`
        for (let i = 2; i < children.length; i += 2) {
                const isElse = i >= children.length - 1
                ret += !isElse
                        ? ` else if (${code(children[i], c)}) {\n${code(children[i + 1], c)}\n}`
                        : ` else {\n${code(children[i], c)}\n}`
        }
        return ret
}

const codeSwitch = (c: NodeContext, x: X, children: X[]) => {
        let ret = `switch (${code(x, c)}) {\n`
        for (let i = 1; i < children.length; i += 2) {
                const isDefault = i >= children.length - 1
                if (isDefault && children.length % 2 === 0) {
                        ret += `default:\n${code(children[i], c)}\nbreak;\n`
                } else if (i + 1 < children.length)
                        ret += `case ${code(children[i], c)}:\n${code(children[i + 1], c)}\nbreak;\n`
        }
        ret += '}'
        return ret
}

const codeDeclare = (c: NodeContext, x: X, y: X) => {
        const varType = infer(x, c)
        const varName = (y as any)?.props?.id
        if (c.isWebGL) return `${varType} ${varName} = ${code(x, c)};`
        const wgslType = formatConversions(varType)
        return `var ${varName}: ${wgslType} = ${code(x, c)};`
}

export const codeDefine = (c: NodeContext, props: NodeProps, returnType: Constants) => {
        const { id, children = [], layout } = props
        const [x, ...args] = children
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
        if (scopeCode) ret += scopeCode
        ret += '\n}'
        return ret
}
