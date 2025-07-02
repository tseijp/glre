import { parseDeclare, parseDefine, parseIf, parseSwitch, parseTexture } from './body'
import { parseAttribHead, parseConstantHead, parseStructHead, parseUniformHead } from './head'
import { is } from '../../utils/helpers'
import { infer } from '../infer'
import { getBluiltin, getOperator, formatConversions, joins } from '../utils'
import type { NodeContext, X } from '../types'

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
        if (type === 'uniform') head = parseUniformHead(c, id, infer(target, c))
        if (type === 'constant') head = parseConstantHead(c, id, infer(target, c), code(x, c))
        if (type === 'struct') head = parseStructHead(c, id, props.fields!)
        if (type === 'attribute') {
                const varType = infer(target, c)
                head = parseAttribHead(c, id, varType)
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
        return code(x, c)
}
