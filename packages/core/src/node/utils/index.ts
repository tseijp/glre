import { infer } from './infer'
import {
        parseArray,
        parseAttribHead,
        parseConstantHead,
        parseDeclare,
        parseDefine,
        parseGather,
        parseIf,
        parseLoop,
        parseScatter,
        parseStorageHead,
        parseStruct,
        parseStructHead,
        parseSwitch,
        parseTexture,
        parseUniformHead,
        parseVaryingHead,
} from './parse'
import { getBluiltin, getConversions, getOperator, initNodeContext, setupEvent } from './utils'
import { is } from '../../utils/helpers'
import { mod } from '..'
import type { Constants as C, NodeContext, Y } from '../types'

export * from './utils'

export const code = <T extends C>(target: Y<T>, c?: NodeContext | null): string => {
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
        const { type, props = {} } = target
        const { id = 'i', children = [], fields, initialValues } = props
        const [x, y, z, w] = children
        /**
         * variables
         */
        if (type === 'variable') return id
        if (type === 'member') return `${code(x, c)}.${code(y, c)}`
        if (type === 'element') return `${code(x, c)}[${code(y, c)}]`
        if (type === 'gather')
                return c.isWebGL //
                        ? parseGather(c, x, y, target)
                        : `${code(x, c)}[${code(y, c)}]`
        if (type === 'scatter') {
                const [storageNode, indexNode] = x.props.children ?? [] // x is gather node
                return c.isWebGL
                        ? parseScatter(c, storageNode, y) // indexNode is not using
                        : `${code(storageNode, c)}[${code(indexNode, c)}] = ${code(y, c)};`
        }
        if (type === 'ternary')
                return c.isWebGL
                        ? `(${code(z, c)} ? ${code(x, c)} : ${code(y, c)})`
                        : `select(${code(x, c)}, ${code(y, c)}, ${code(z, c)})`
        if (type === 'conversion') return `${getConversions(x, c)}(${parseArray(children.slice(1), c)})`
        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                if (x === 'mod') return code(mod(y, z), c)
                if (x.endsWith('Assign')) return `${code(y, c)} ${getOperator(x)} ${code(z, c)};`
                return `(${code(y, c)} ${getOperator(x)} ${code(z, c)})`
        }
        if (type === 'function') {
                if (x === 'negate') return `(-${code(y, c)})`
                if (x === 'reciprocal') return `(1.0 / ${code(y, c)})`
                if (x === 'oneMinus') return `(1.0-${code(y, c)})`
                if (x === 'saturate') return `clamp(${code(y, c)}, 0.0, 1.0)`
                if (x === 'texture') return parseTexture(c, y, z, w)
                if (x === 'atan2' && c.isWebGL) return `atan(${code(y, c)}, ${code(z, c)})`
                return `${x}(${parseArray(children.slice(1), c)})`
        }
        /**
         * scopes
         */
        if (type === 'scope') return children.map((child: any) => code(child, c)).join('\n')
        if (type === 'assign') return `${code(x, c)} = ${code(y, c)};`
        if (type === 'return') return `return ${code(x, c)};`
        if (type === 'break') return 'break;'
        if (type === 'continue') return 'continue;'
        if (type === 'loop') return parseLoop(c, x, y, id)
        if (type === 'if') return parseIf(c, x, y, children)
        if (type === 'switch') return parseSwitch(c, x, children)
        if (type === 'declare') return parseDeclare(c, x, y)
        if (type === 'define') {
                if (!c.code?.headers.has(id)) c.code?.headers.set(id, parseDefine(c, props, target))
                return `${id}(${parseArray(children.slice(1), c)})`
        }
        if (type === 'struct') {
                if (!c.code?.headers.has(id)) c.code?.headers.set(id, parseStructHead(c, id, fields))
                return parseStruct(c, id, x.props.id, initialValues)
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
                if (c.isWebGL) return getBluiltin(c, id)
                if (id === 'position') return 'out.position'
                const field = `@builtin(${id}) ${id}: ${getConversions(infer(target, c), c)}`
                if (c.label === 'compute') c.code?.computeInputs.set(id, field)
                else if (c.label === 'frag') c.code?.fragInputs.set(id, field)
                else if (c.label === 'vert') c.code?.vertInputs.set(id, field)
                return `in.${id}`
        }
        if (type === 'attribute' || type === 'instance') {
                setupEvent(c, id, type, target, x)
                c.code?.vertInputs.set(id, parseAttribHead(c, id, infer(target, c)))
                return c.isWebGL ? `${id}` : `in.${id}`
        }
        if (c.code?.headers.has(id)) return id // must last
        let head = ''
        if (type === 'uniform') {
                const varType = infer(target, c)
                setupEvent(c, id, varType, target, x)
                head = parseUniformHead(c, id, varType)
        }
        if (type === 'storage') head = parseStorageHead(c, id, infer(target, c))
        if (type === 'constant') head = parseConstantHead(c, id, infer(target, c), code(x, c))
        if (head) {
                c.code?.headers.set(id, head)
                return id
        }
        return code(x, c)
}
