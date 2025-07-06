import { is } from '../utils/helpers'
import { infer } from './infer'
import { getBluiltin, getOperator, formatConversions, joins } from './utils'
import type { NodeContext, X } from './types'
import {
        parseAttribHead,
        parseConstantHead,
        parseUniformHead,
        parseDeclare,
        parseDefine,
        parseIf,
        parseSwitch,
        parseTexture,
} from './parse'
import { BUILTIN_TYPES } from './const'

export const code = (target: X, c?: NodeContext | null): string => {
        if (!c) c = {}
        if (!c.headers) c.headers = new Map()
        if (!c.inputs) c.inputs = new Map()
        if (!c.outputs)
                c.outputs = new Map([['position', c.isWebGL ? 'vec4 position;' : '@builtin(position) position: vec4f']])
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
         * variables
         */
        if (type === 'variable') return id
        if (type === 'swizzle') return `${code(y, c)}.${code(x, c)}`
        if (type === 'ternary') return `(${code(x, c)} ? ${code(y, c)} : ${code(z, c)})`
        if (type === 'conversion') return `${formatConversions(x, c)}(${joins(children.slice(1), c)})`
        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                return `(${code(y, c)} ${getOperator(x)} ${code(z, c)})`
        }
        if (type === 'function') {
                if (x === 'negate') return `(-${joins(children.slice(1), c)})`
                if (x === 'texture') return parseTexture(c, y, z, w)
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
        if (type === 'if') return parseIf(c, x, y, children)
        if (type === 'switch') return parseSwitch(c, x, children)
        if (type === 'declare') return parseDeclare(c, x, y)
        if (type === 'define') {
                const returnType = infer(target, c)
                const args = children.slice(1)
                const ret = `${id}(${joins(args, c)})`
                if (c.headers.has(id)) return ret
                c.headers.set(id, parseDefine(c, props, returnType))
                return ret
        }
        /**
         * inputs and outputs
         */
        if (type === 'varying') {
                const varType = infer(target, c)
                const location = c.outputs.size
                if (c.isWebGL) {
                        c.outputs.set(id, `out ${varType} ${id};`)
                } else c.outputs.set(id, `@location(${location}) ${id}: ${formatConversions(varType, c)}`)
                if (c.isWebGL) return id
                else return `out.${id}`
        }
        if (type === 'builtin') {
                if (c.isWebGL) return getBluiltin(id)
                const varType = BUILTIN_TYPES[id as keyof typeof BUILTIN_TYPES]!
                if (id === 'position') return 'out.position'
                c.outputs.set(id, `@builtin(${id}) ${id}: ${formatConversions(varType, c)}`)
                c.inputs.set(id, `@builtin(${id}) ${id}: ${formatConversions(varType, c)}`)
                return `input.${id}`
        }
        /**
         * headers
         */
        if (c.headers.has(id)) return id //
        let head = ''
        if (type === 'attribute') {
                const varType = infer(target, c)
                head = parseAttribHead(c, id, varType)
                if (!c.isWebGL && c.inputs) {
                        const location = c.inputs.size
                        c.inputs.set(id, `@location(${location}) ${id}: ${formatConversions(varType, c)}`)
                        return `input.${id}`
                }
        }
        if (type === 'uniform') head = parseUniformHead(c, id, infer(target, c))
        if (type === 'constant') head = parseConstantHead(c, id, infer(target, c), code(x, c))
        if (head) {
                c.headers.set(id, head)
                return id
        }
        return code(x, c)
}
