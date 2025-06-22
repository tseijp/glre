import { is } from '../utils/helpers'
import { TYPE_MAPPING } from './const'
import { inferType, joins, formatWebGPUType, getOperator } from './utils'
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

        if (type === 'uniform') {
                const varType = inferType(target, c)
                c.uniforms.add(`${varType} ${id}`)
                c.onUniform?.(id, props.defaultValue)
                return id
        }

        if (type === 'variable') return id

        if (type === 'swizzle') return `${code(y, c)}.${code(x, c)}`

        if (type === 'node_type') {
                if (!is.str(x)) return id
                const func = formatWebGPUType(x, c)
                const args = joins(children.slice(1), c)
                return `${func}(${args})`
        }

        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                const op = getOperator(x as string)
                return `(${code(y, c)} ${op} ${code(z, c)})`
        }

        if (type === 'math_fun') return `${x}(${joins(children.slice(1), c)})`

        if (type === 'assign') return `${code(x, c)} = ${code(y, c)};`

        if (type === 'scope') return children.map((child: any) => code(child, c)).join('\n')

        if (type === 'loop') return `for (int i = 0; i < ${x}; i++) {\n${code(y, c)}\n}`

        if (type === 'fn') {
                let ret = code(x, c)
                if (y) ret += `\nreturn ${code(y, c)};`
                return ret
        }

        if (type === 'fn_call') {
                const funcId = id
                const args = children.map((child) => code(child, c)).join(', ')
                return `${funcId}(${args})`
        }

        if (type === 'constant') {
                return id
        }

        if (type === 'vertex_stage') {
                return code(x, c)
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

        if (type === 'switch') {
                let ret = `switch (${code(x, c)}) {\n`
                for (const child of children.slice(1)) {
                        ret += code(child, c) + '\n'
                }
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

        if (type === 'default') {
                return `default:\n${code(x, c)}\nbreak;\n`
        }

        if (type === 'ternary') {
                return `(${code(x, c)} ? ${code(y, c)} : ${code(z, c)})`
        }

        if (type === 'texture') {
                const [func, tex, uv, level] = children
                if (func === 'texture') {
                        return level
                                ? `texture(${code(tex, c)}, ${code(uv, c)}, ${code(level, c)})`
                                : `texture(${code(tex, c)}, ${code(uv, c)})`
                }
                if (func === 'cubeTexture') {
                        return level
                                ? `cubeTexture(${code(tex, c)}, ${code(uv, c)}, ${code(level, c)})`
                                : `cubeTexture(${code(tex, c)}, ${code(uv, c)})`
                }
                if (func === 'textureSize') {
                        return level
                                ? `textureSize(${code(tex, c)}, ${code(level, c)})`
                                : `textureSize(${code(tex, c)})`
                }
                return `${func}(${joins(children.slice(1), c)})`
        }

        if (type === 'attribute') return id

        if (type === 'varying') return id

        if (type === 'builtin') {
                // WebGL/WebGPU builtin variables mapping
                if (c?.isWebGL) {
                        if (id === 'screenCoordinate') return 'gl_FragCoord'
                        if (id === 'screenUV') return 'gl_FragCoord.xy'
                } else {
                        if (id === 'screenCoordinate') return 'position'
                        if (id === 'screenUV') return 'position.xy'
                }
                return id
        }

        if (type === 'declare') {
                const varType = inferType(y, c)
                const varName = (x as any)?.props?.id
                if (c.isWebGL) return `${varType} ${varName} = ${code(y, c)};`
                const wgslType = TYPE_MAPPING[varType as keyof typeof TYPE_MAPPING]
                return `var ${varName}: ${wgslType} = ${code(y, c)};`
        }

        return code(x, c)
}
