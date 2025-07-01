import { is } from '../utils/helpers'
import { infer } from './infer'
import { getBluiltin, getOperator, formatConversions, joins } from './utils'
import type { Constants, NodeContext, NodeProps, X } from './types'

export const code = (target: X, c?: NodeContext | null): string => {
        if (!c) c = {}
        if (!c.headers) c.headers = new Map()
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
        const [x, y, z] = children
        /**
         * headers
         */
        let head = ''
        if (type === 'attribute') {
                if (!c.isWebGL) {
                        const varType = infer(target, c)
                        if (!c.arguments) c.arguments = new Map()
                        const { location } = c.webgpu?.attribs.map.get(id)!
                        c.arguments.set(id, { location, type: varType })
                        return id
                }
                if (c.headers.has(id)) return id
                head = `in ${infer(target, c)} ${id};`
        }
        if (type === 'uniform') {
                if (c.headers.has(id)) return id
                const varType = infer(target, c)
                if (c.isWebGL) {
                        head = `uniform ${varType} ${id};`
                } else {
                        const { group, binding } = c.webgpu?.uniforms.map.get(id)!
                        const wgslType = formatConversions(varType, c)
                        head = `@group(${group}) @binding(${binding}) var<uniform> ${id}: ${wgslType};`
                }
        }
        if (type === 'constant') {
                if (c.headers.has(id)) return id
                const varType = infer(target, c)
                const value = code(x, c)
                head = c.isWebGL
                        ? `const ${varType} ${id} = ${value};`
                        : `const ${id}: ${formatConversions(varType, c)} = ${value};`
        }
        if (type === 'varying') {
                if (c.headers.has(id)) return id
                head = `${infer(target, c)} ${id}`
        }
        if (head) {
                c.headers.set(id, head)
                c.onMount?.(id)
                return id
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
                const ret = `${id}(${args.map((arg) => code(arg, c))})`
                if (c.headers.has(id)) return ret
                c.headers.set(id, codeDefine(props, returnType, c))
                return ret
        }
        return code(x, c)
}

const codeIf = (c: NodeContext, x: X, y: X, children: X[]) => {
        let ret = `if (${code(x, c)}) {\n${code(y, c)}\n}`
        for (let i = 2; i < children.length; i += 2) {
                const isElseIf = i >= children.length - 1
                ret += !isElseIf
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

export const codeDefine = (props: NodeProps, returnType: Constants, c: NodeContext) => {
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
