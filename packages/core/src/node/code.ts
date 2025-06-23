import { is } from '../utils/helpers'
import { TYPE_MAPPING } from './const'
import { infer } from './infer'
import { joins, getOperator, formatConversions } from './utils'
import type { NodeConfig, X } from './types'

export const code = (target: X, c?: NodeConfig | null): string => {
        if (!c) c = {}
        if (!c.uniforms) c.uniforms = new Set()
        if (is.num(target)) return target.toFixed(1)
        if (is.str(target)) return target
        if (is.bol(target)) return target.toString()
        if (!target) return '' // ignore if no target
        const { type, props } = target
        const { id = '', children = [] } = props
        const [x, y, z] = children
        // variables
        if (type === 'uniform') {
                const varType = infer(target, c)
                c.uniforms.add(`${varType} ${id}`)
                c.onUniform?.(id, props.value)
                return id
        }
        if (type === 'variable' || type === 'varying' || type === 'constant' || type === 'attribute') return id
        if (type === 'vertex_stage') return code(x, c)
        if (type === 'swizzle') return `${code(y, c)}.${code(x, c)}`
        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                return `(${code(y, c)} ${getOperator(x)} ${code(z, c)})`
        }
        if (type === 'math_fun') return `${x}(${joins(children.slice(1), c)})`
        if (type === 'conversions') return `${formatConversions(x, c)}(${joins(children.slice(1), c)})`
        // scopes
        if (type === 'scope') return children.map((child: any) => code(child, c)).join('\n')
        if (type === 'assign') return `${code(x, c)} = ${code(y, c)};`
        if (type === 'fn_run') return `${id}(${children.map((child) => code(child, c)).join(', ')})`
        if (type === 'fn_def') {
                const paramNames = props.paramNames || []
                const paramTypes = props.paramTypes || []
                const returnType = props.returnType || infer(y, c)
                const scopeCode = code(x, c)
                const returnCode = y ? `return ${code(y, c)};` : ''

                const params = paramNames
                        .map((name, i) => {
                                const paramType = paramTypes[i] || 'float'
                                return `${paramType} ${name}`
                        })
                        .join(', ')

                if (c?.isWebGL) {
                        return `${returnType} ${id}(${params}) {\n${scopeCode}\n${returnCode}\n}`
                } else {
                        const wgslReturnType = TYPE_MAPPING[returnType as keyof typeof TYPE_MAPPING] || returnType
                        const wgslParams = paramNames
                                .map((name, i) => {
                                        const paramType = paramTypes[i] || 'float'
                                        const wgslParamType =
                                                TYPE_MAPPING[paramType as keyof typeof TYPE_MAPPING] || paramType
                                        return `${name}: ${wgslParamType}`
                                })
                                .join(', ')
                        return `fn ${id}(${wgslParams}) -> ${wgslReturnType} {\n${scopeCode}\n${returnCode}\n}`
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
                for (const value of values) {
                        ret += `case ${code(value, c)}:\n`
                }
                ret += `${code(scope, c)}\nbreak;\n`
                return ret
        }
        if (type === 'default') `default:\n${code(x, c)}\nbreak;\n`
        if (type === 'ternary') return `(${code(x, c)} ? ${code(y, c)} : ${code(z, c)})`
        if (type === 'declare') {
                const varType = infer(y, c)
                const varName = (x as any)?.props?.id
                if (c.isWebGL) return `${varType} ${varName} = ${code(y, c)};`
                const wgslType = TYPE_MAPPING[varType as keyof typeof TYPE_MAPPING]
                return `var ${varName}: ${wgslType} = ${code(y, c)};`
        }
        // WebGL/WebGPU builtin variables mapping
        if (type === 'builtin') {
                if (c?.isWebGL) {
                        if (id === 'position') return 'gl_FragCoord'
                        if (id === 'uv') return 'gl_FragCoord.xy'
                }
                return id
        }
        return code(x, c)
}
