import { is } from '../utils/helpers'
import { infer } from './infer'
import { joins, getOperator, formatConversions } from './utils'
import type { NodeConfig, X } from './types'

export const code = (target: X, c?: NodeConfig | null): string => {
        if (!c) c = {}
        if (!c.headers) c.headers = new Map()
        if (is.str(target)) return target
        if (is.num(target)) return target.toFixed(1)
        if (is.bol(target)) return target ? 'true' : 'false'
        if (!target) return '' // ignore if no target
        const { type, props } = target
        const { id = '', children = [] } = props
        const [x, y, z] = children
        let head = ''
        if (type === 'uniform') {
                if (c.headers.has(id)) return id
                if (!c.binding) c.binding = 0
                head = c.isWebGL
                        ? `uniform ${infer(target, c)} ${id};`
                        : `@group(0) @binding(${c.binding++}) var<uniform> ${id}: ${infer(target, c)};`
        }
        if (type === 'attribute') {
                if (c.headers.has(id)) return id
                head = `${infer(target, c)} ${id}`
        }
        if (type === 'constant') {
                if (c.headers.has(id)) return id
                head = `${infer(target, c)} ${id}`
        }
        if (type === 'varying') {
                if (c.headers.has(id)) return id
                head = `${infer(target, c)} ${id}`
        }
        if (head) {
                c.headers.set(id, head)
                c.onMount?.(id, props.value)
                return id
        }
        if (type === 'variable') return id
        if (type === 'swizzle') return `${code(y, c)}.${code(x, c)}`
        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                return `(${code(y, c)} ${getOperator(x)} ${code(z, c)})`
        }
        if (type === 'function') return `${x}(${joins(children.slice(1), c)})`
        if (type === 'conversion') return `${formatConversions(x, c)}(${joins(children.slice(1), c)})`
        if (type === 'scope') return children.map((child: any) => code(child, c)).join('\n')
        if (type === 'assign') return `${code(x, c)} = ${code(y, c)};`
        if (type === 'fn_run') {
                if (!c.headers.has(id)) c.headers.set(id, code(x, c))
                const args = children.slice(1).map((child) => code(child, c))
                return `${id}(${args.join(', ')})`
        }
        if (type === 'fn_def') {
                const { paramInfo = [], returnType } = props
                const lines = []
                const scopeCode = code(x, c)
                if (scopeCode) lines.push(scopeCode)
                if (y) lines.push(`return ${code(y, c)};`)
                if (c?.isWebGL) {
                        const params = paramInfo.map(({ name, type }) => `${type} ${name}`).join(', ')
                        return `${returnType} ${id}(${params}) {\n${lines.join('\n')}\n}`
                } else {
                        const wgslReturnType = formatConversions(returnType, c)
                        const wgslParams = paramInfo
                                .map(({ name, type }) => {
                                        const wgslParamType = formatConversions(type, c)
                                        return `${name}: ${wgslParamType}`
                                })
                                .join(', ')
                        return `fn ${id}(${wgslParams}) -> ${wgslReturnType} {\n${lines.join('\n')}\n}`
                }
        }
        if (type === 'loop') return `for (int i = 0; i < ${x}; i++) {\n${code(y, c)}\n}`
        if (type === 'if') {
                let ret = `if (${code(x, c)}) {\n${code(y, c)}\n}`
                for (let i = 2; i < children.length; i += 2) {
                        const isLast = i >= children.length - 1
                        ret += !isLast
                                ? ` else if (${code(children[i], c)}) {\n${code(children[i + 1], c)}\n}`
                                : ` else {\n${code(children[i], c)}\n}`
                }
                return ret
        }
        if (type === 'switch') {
                let ret = `switch (${code(x, c)}) {\n`
                for (const child of children.slice(1)) ret += code(child, c) + '\n'
                ret += '}'
                return ret
        }
        if (type === 'case') {
                const values = children.slice(0, -1)
                const scope = children[children.length - 1]
                let ret = ''
                for (const value of values) ret += `case ${code(value, c)}:\n`
                ret += `${code(scope, c)}\nbreak;\n`
                return ret
        }
        if (type === 'default') `default:\n${code(x, c)}\nbreak;\n`
        if (type === 'ternary') return `(${code(x, c)} ? ${code(y, c)} : ${code(z, c)})`
        if (type === 'declare') {
                const varType = infer(y, c)
                const varName = (x as any)?.props?.id
                if (c.isWebGL) return `${varType} ${varName} = ${code(y, c)};`
                const wgslType = formatConversions(varType)
                return `var ${varName}: ${wgslType} = ${code(y, c)};`
        }
        if (type === 'builtin') {
                if (c?.isWebGL) {
                        if (id === 'position') return 'gl_FragCoord'
                        if (id === 'uv') return 'gl_FragCoord.xy'
                }
                return id
        }
        return code(x, c)
}
