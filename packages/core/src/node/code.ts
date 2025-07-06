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
        parseVaryingHead,
} from './parse'

export const code = (target: X, c?: NodeContext | null): string => {
        if (!c) c = {}
        if (!c.varyings) c.varyings = new Map()
        if (!c.headers) c.headers = new Map()
        if (!c.inputs) c.inputs = new Map()
        if (!c.outputs) {
                c.outputs = new Map()
                c.outputs.set('position', c.isWebGL ? 'vec4 position;' : '@builtin(position) position: vec4f') // default builtin outputs
        }
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
                const ret = `${id}(${joins(children.slice(1), c)})`
                if (c.headers.has(id)) return ret
                c.headers.set(id, parseDefine(c, props, infer(target, c)))
                return ret
        }
        /**
         * headers
         */
        if (type === 'varying') {
                if (c.outputs.has(id)) return c.isWebGL ? `${id}` : `out.${id}`
                c.outputs.set(id, parseVaryingHead(c, id, infer(target, c)))
                c.varyings.set(id, code(x, c))
                return c.isWebGL ? `${id}` : `out.${id}`
        }
        if (type === 'builtin') {
                if (c.isWebGL) return getBluiltin(id)
                if (id === 'position') return 'out.position'
                const code = `@builtin(${id}) ${id}: ${formatConversions(infer(id, c), c)}`
                c.outputs.set(id, code)
                c.inputs.set(id, code)
                return `in.${id}`
        }
        if (type === 'attribute') {
                c.inputs.set(id, parseAttribHead(c, id, infer(target, c)))
                return c.isWebGL ? `${id}` : `in.${id}`
        }
        if (c.headers.has(id)) return id // must last
        let head = ''
        if (type === 'uniform') head = parseUniformHead(c, id, infer(target, c))
        if (type === 'constant') head = parseConstantHead(c, id, infer(target, c), code(x, c))
        if (head) {
                c.headers.set(id, head)
                return id
        }
        return code(x, c)
}
