import { is } from '../utils/helpers'
import { infer } from './infer'
import { getBluiltin, getOperator, generateDefine, formatConversions, joins } from './utils'
import type { NodeConfig, X } from './types'

export const code = (target: X, c?: NodeConfig | null): string => {
        if (!c) c = {}
        if (!c.headers) c.headers = new Map()
        if (is.str(target)) return target
        if (is.num(target)) {
                const ret = `${target}`
                if (ret.includes('.')) return ret
                return ret + '.0'
        }
        if (is.bol(target)) return target ? 'true' : 'false'
        if (!target) return '' // ignore if no target
        const { type, props } = target
        const { id = '', children = [] } = props
        const [x, y, z] = children
        /**
         * headers
         */
        let head = ''
        if (type === 'attribute') {
                if (c.headers.has(id)) return id
                head = `${infer(target, c)} ${id}`
        }
        if (type === 'uniform') {
                if (c.headers.has(id)) return id
                if (!c.binding) c.binding = 0
                const varType = infer(target, c)
                head = c.isWebGL
                        ? `uniform ${varType} ${id};`
                        : `@group(0) @binding(${c.binding++}) var<uniform> ${id}: ${formatConversions(varType, c)};`
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
        if (type === 'loop')
                return c.isWebGL
                        ? `for (int i = 0; i < ${x}; i += 1) {\n${code(y, c)}\n}`
                        : `for (var i: i32 = 0; i < ${x}; i++) {\n${code(y, c)}\n}`
        if (type === 'define') {
                const args = children.slice(2)
                const ret = `${id}(${args.map((arg) => code(arg, c))})`
                if (c.headers.has(id)) return ret
                c.headers.set(id, generateDefine(props, c))
                return ret
        }
        if (type === 'if') {
                let ret = `if (${code(x, c)}) {\n${code(y, c)}\n}`
                for (let i = 2; i < children.length; i += 2) {
                        const isElseIf = i >= children.length - 1
                        ret += !isElseIf
                                ? ` else if (${code(children[i], c)}) {\n${code(children[i + 1], c)}\n}`
                                : ` else {\n${code(children[i], c)}\n}`
                }
                return ret
        }
        if (type === 'switch') {
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
        if (type === 'declare') {
                const varType = infer(x, c)
                const varName = (y as any)?.props?.id
                if (c.isWebGL) return `${varType} ${varName} = ${code(x, c)};`
                const wgslType = formatConversions(varType)
                return `var ${varName}: ${wgslType} = ${code(x, c)};`
        }
        return code(x, c)
}
