import { is } from '../utils/helpers'
import { OPERATORS, TYPE_MAPPING } from './const'
import { generateFragmentMain, generateUniforms, inferType, joins } from './utils'
import type { NodeConfig, X } from './types'

export const code = (target: X, c?: NodeConfig | null): string => {
        if (!c) c = {}
        if (!c.uniforms) c.uniforms = new Set()
        if (is.num(target)) return target.toFixed(1)
        if (is.str(target)) return target
        if (!target) return '' // ignore if no target

        const { type, props } = target
        const { id = '', children = [] } = props
        const [x, y, z] = children

        if (type === 'uniform') {
                c.uniforms.add(id)
                c.onUniform?.(id, props.defaultValue)
                return id
        }

        if (type === 'variable') return id

        if (type === 'swizzle') return `${code(y, c)}.${code(x, c)}`

        if (type === 'node_type') {
                if (!is.str(x)) return id
                const func = !c.isWebGL && x.startsWith('vec') ? `${x}f` : x
                const args = joins(children.slice(1), c)
                return `${func}(${args})`
        }

        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                const op = OPERATORS[x as keyof typeof OPERATORS]
                return `(${code(y, c)} ${op} ${code(z, c)})`
        }

        if (type === 'math_fun') {
                const funcName = x
                const args = joins(children.slice(1), c)
                return `${funcName}(${args})`
        }

        if (type === 'declare') {
                const varType = inferType(y, c) // vec2
                const varName = (x as any)?.props?.id
                if (c.isWebGL) return `${varType} ${varName} = ${code(y, c)};`
                const wgslType = TYPE_MAPPING[varType as keyof typeof TYPE_MAPPING]
                return `var ${varName}: ${wgslType} = ${code(y, c)};`
        }

        if (type === 'assign') return `${code(x, c)} = ${code(y, c)};`

        if (type === 'scope') return children.map((child) => code(child, c)).join('\n')

        if (type === 'fn') {
                let ret = code(x, c)
                ret += '\n'
                if (y) ret += `return ${code(y, c)};`
                return ret
        }

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

        if (type === 'loop') {
                if (is.num(x)) return `for (int i = 0; i < ${x}; i++) {\n${code(y, c)}\n}`
                return `while (${code(x, c)}) {\n${code(y, c)}\n}`
        }

        if (type === 'fragment') {
                const body = code(x, c)
                const uniforms = generateUniforms(c)
                return generateFragmentMain(body, uniforms, c.isWebGL)
        }

        return code(x, c)
}
