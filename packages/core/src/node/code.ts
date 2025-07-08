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
        parseStorageBuffer,
        parseWorkgroupStorage,
        parseBarrier,
} from './parse'

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
        if (!c.storageBuffers) c.storageBuffers = new Map()
        if (!c.workgroupVars) c.workgroupVars = new Map()
        if (!c.computeBuiltins) c.computeBuiltins = new Map()
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
                        : `select(${code(x, c)}, ${code(y, c)}, ${code(z, c)})`
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
                c.vertInputs.set(id, parseAttribHead(c, id, infer(target, c)))
                return c.isWebGL ? `${id}` : `in.${id}`
        }
        /**
         * compute shader
         */
        if (type === 'storage') {
                const varType = infer(target, c)
                const access = props.access || 'read_write'
                const head = parseStorageBuffer(c, id, varType, access)
                c.storageBuffers.set(id, head)
                return `${id}[${code(x, c)}]`
        }
        if (type === 'workgroup') {
                const varType = infer(target, c)
                const size = props.size
                const head = parseWorkgroupStorage(c, id, varType, size)
                c.workgroupVars.set(id, head)
                return id
        }
        if (type === 'barrier') {
                const barrierType = props.type || 'workgroup'
                return parseBarrier(c, barrierType)
        }
        if (type === 'atomic') {
                const op = props.op || 'atomicAdd'
                return `${op}(${code(x, c)}, ${code(y, c)})`
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
