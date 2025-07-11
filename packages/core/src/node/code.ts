import { is } from '../utils/helpers'
import { infer } from './infer'
import {
        parseArray,
        parseAttribHead,
        parseConstantHead,
        parseDeclare,
        parseDefine,
        parseIf,
        parseStruct,
        parseStructHead,
        parseSwitch,
        parseTexture,
        parseVaryingHead,
        parseUniformHead,
} from './parse'
import { getBluiltin, getOperator, formatConversions, safeEventCall, getEventFun, initNodeContext } from './utils'
import type { Constants, NodeContext, X } from './types'

export const code = <T extends Constants>(target: X<T>, c?: NodeContext | null): string => {
        if (!c) c = {}
        initNodeContext(c)
        if (is.arr(target)) return parseArray(target, c)
        if (is.str(target)) return target
        if (is.num(target)) {
                const ret = `${target}`
                if (ret.includes('.')) return ret
                // Check if this number should be an integer based on the inferred type
                // For now, keep the original behavior to maintain compatibility
                return ret + '.0'
        }
        if (is.bol(target)) return target ? 'true' : 'false'
        if (!target) return ''
        const { type, props } = target
        const { id = '', children = [], fields, initialValues } = props
        const [x, y, z, w] = children
        /**
         * variables
         */
        if (type === 'variable') return id
        if (type === 'member') return `${code(y, c)}.${code(x, c)}`
        if (type === 'ternary')
                return c.isWebGL
                        ? `(${code(z, c)} ? ${code(x, c)} : ${code(y, c)})`
                        : `select(${code(x, c)}, ${code(y, c)}, ${code(z, c)})`
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
                        ? `for (int i = 0; i < ${code(x, c)}; i += 1) {\n${code(y, c)}\n}`
                        : `for (var i: i32 = 0; i < ${code(x, c)}; i++) {\n${code(y, c)}\n}`
        if (type === 'if') return parseIf(c, x, y, children)
        if (type === 'switch') return parseSwitch(c, x, children)
        if (type === 'declare') return parseDeclare(c, x, y)
        if (type === 'define') {
                if (!c.code?.headers.has(id)) c.code?.headers.set(id, parseDefine(c, props, infer(target, c)))
                return `${id}(${parseArray(children.slice(1), c)})`
        }
        if (type === 'struct') {
                if (!c.code?.headers.has(id)) c.code?.headers.set(id, parseStructHead(c, id, fields))
                return parseStruct(c, id, x.props.id, fields, initialValues)
        }
        /**
         * headers
         */
        if (type === 'varying') {
                if (c.code?.vertOutputs.has(id)) return c.isWebGL ? `${id}` : `out.${id}`
                const field = parseVaryingHead(c, id, infer(target, c))
                c.code?.fragInputs.set(id, field)
                c.code?.vertOutputs.set(id, field)
                c.code?.vertVaryings.set(id, code(x, c))
                return c.isWebGL ? `${id}` : `out.${id}`
        }
        if (type === 'builtin') {
                if (c.isWebGL) return getBluiltin(id)
                if (id === 'position') return 'out.position'
                const field = `@builtin(${id}) ${id}: ${formatConversions(infer(target, c), c)}`
                if (c.isFrag) {
                        c.code?.fragInputs.set(id, field)
                } else c.code?.vertInputs.set(id, field)
                return `in.${id}`
        }
        if (type === 'attribute') {
                const fun = getEventFun(c, id, true)
                safeEventCall(x, fun)
                target.listeners.add(fun)
                c.code?.vertInputs.set(id, parseAttribHead(c, id, infer(target, c)))
                return c.isWebGL ? `${id}` : `in.${id}`
        }
        if (c.code?.headers.has(id)) return id // must last
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
                c.code?.headers.set(id, head)
                return id
        }
        return code(x, c)
}
