import { is } from '../utils/helpers'
import { infer } from './infer'
import {
        parseAttribHead,
        parseArray,
        parseConstantHead,
        parseUniformHead,
        parseDeclare,
        parseDefine,
        parseIf,
        parseSwitch,
        parseTexture,
        parseVaryingHead,
} from './parse'
import { getBluiltin, getOperator, formatConversions, safeEventCall, getEventFun } from './utils'
import type { NodeContext, X } from './types'

export const code = (target: X, c?: NodeContext | null): string => {
        if (!c) c = {}
        if (!c.headers) c.headers = new Map()
        if (!c.vertVaryings) c.vertVaryings = new Map()
        if (!c.fragInputs) c.fragInputs = new Map()
        if (!c.vertInputs) c.vertInputs = new Map()
        if (!c.vertOutputs) {
                c.vertOutputs = new Map()
                if (!c.isWebGL) {
                        c.fragInputs.set('position', '@builtin(position) position: vec4f')
                        c.vertOutputs.set('position', '@builtin(position) position: vec4f')
                }
        }
        if (is.arr(target)) return parseArray(target, c)
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
        if (type === 'ternary')
                return c.isWebGL
                        ? `(${code(x, c)} ? ${code(y, c)} : ${code(z, c)})`
                        : `select(${code(z, c)}, ${code(y, c)}, ${code(x, c)})`
        if (type === 'conversion') return `${formatConversions(x, c)}(${parseArray(children.slice(1), c)})`
        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                return `(${code(y, c)} ${getOperator(x)} ${code(z, c)})`
        }
        if (type === 'function') {
                if (x === 'negate') return `(-${parseArray(children.slice(1), c)})`
                if (x === 'texture') return parseTexture(c, y, z, w)
                return `${x}(${parseArray(children.slice(1), c)})`
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
                const ret = `${id}(${parseArray(children.slice(1), c)})`
                if (c.headers.has(id)) return ret
                c.headers.set(id, parseDefine(c, props, infer(target, c)))
                return ret
        }
        /**
         * headers
         */
        if (type === 'varying') {
                if (c.vertOutputs.has(id)) return c.isWebGL ? `${id}` : `out.${id}`
                const field = parseVaryingHead(c, id, infer(target, c))
                c.fragInputs.set(id, field)
                c.vertOutputs.set(id, field)
                c.vertVaryings.set(id, code(x, c))
                return c.isWebGL ? `${id}` : `out.${id}`
        }
        if (type === 'builtin') {
                if (c.isWebGL) return getBluiltin(id)
                if (id === 'position') return 'out.position'
                const field = `@builtin(${id}) ${id}: ${formatConversions(infer(target, c), c)}`
                if (c.isFrag) {
                        c.fragInputs.set(id, field)
                } else c.vertInputs.set(id, field)
                return `in.${id}`
        }
        if (type === 'attribute') {
                const fun = getEventFun(c, id, true)
                safeEventCall(x, fun)
                target.listeners.add(fun)
                c.vertInputs.set(id, parseAttribHead(c, id, infer(target, c)))
                return c.isWebGL ? `${id}` : `in.${id}`
        }
        if (c.headers.has(id)) return id // must last
        let head = ''
        if (type === 'uniform') {
                const varType = infer(target, c)
                const fun = getEventFun(c, id, false, varType === 'texture')
                safeEventCall(x, fun)
                target.listeners.add(fun)
                head = parseUniformHead(c, id, varType)
        }
        if (type === 'constant') head = parseConstantHead(c, id, infer(target, c), code(x, c))
        if (head) {
                c.headers.set(id, head)
                return id
        }
        return code(x, c)
}
