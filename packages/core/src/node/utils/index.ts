import { infer } from './infer'
import { parseArray, parseAttribHead, parseAttributeArrayHead, parseConstantHead, parseDeclare, parseDefine, parseGather, parseIf, parseLoop, parseScatter, parseStorageHead, parseStruct, parseStructHead, parseSwitch, parseTexture, parseTextureArray, parseTextureArrayHead, parseUniformArrayHead, parseUniformHead, parseVaryingHead } from './parse'
import { getBluiltin, getConversions, getOperator, initNodeContext, isX, setupEvent } from './utils'
import { is } from '../../helpers'
import type { Constants as C, NodeContext, Y, X } from '../types'

export * from './utils'

export const mod = <T extends C, U extends C>(x: X<T>, y: number | X<U>) => {
        return (x as any).sub((x as any).div(y).floor().mul(y)) as X<T>
}

const parseNumber = (target = 0) => {
        const ret = `${target}`
        if (ret.includes('.')) return ret
        // Check if this number should be an integer based on the inferred type
        // For now, keep the original behavior to maintain compatibility
        return ret + '.0'
}

const codeChildren = (children: Y[], c: NodeContext) => {
        return children.map((child) => code(child, c))
}

export const code = <T extends C>(target: Y<T>, c = {} as NodeContext): string => {
        initNodeContext(c)
        if (is.arr(target)) return parseArray(codeChildren(target, c))
        if (is.str(target)) return target
        if (is.num(target)) return parseNumber(target)
        if (is.bol(target)) return target ? 'true' : 'false'
        if (!target) return ''
        if (!isX(target)) return ''
        const { type, props = {} } = target
        const { id = 'i', children = [], fields, initialValues } = props
        const [x, y, z, w] = children
        /**
         * variables
         */
        if (type === 'variable') return id
        if (type === 'member') return `${code(x, c)}.${code(y, c)}`
        if (type === 'element') {
                if (isX(x) && x.type === 'uniformArray' && infer(x, c) === 'texture') return code(x, c)
                if (!c.isWebGL && isX(x) && infer(x, c) === 'texture') return `${code(x, c)}${is.num(y) ? y : code(y, c)}`
                return `${code(x, c)}[${code(y, c)}]`
        }
        if (type === 'gather')
                return c.isWebGL //
                        ? parseGather(c, code(x, c), code(y, c), infer(target, c))
                        : `${code(x, c)}[${code(y, c)}]`
        if (type === 'scatter') {
                const [storageNode, indexNode] = x.props.children ?? [] // @MEMO x is gather node
                return c.isWebGL
                        ? parseScatter(code(storageNode, c), code(y, c), infer(y, c)) // @MEMO indexNode is not using
                        : `${code(storageNode, c)}[${code(indexNode, c)}] = ${code(y, c)};`
        }
        if (type === 'ternary') return c.isWebGL ? `(${code(z, c)} ? ${code(x, c)} : ${code(y, c)})` : `select(${code(x, c)}, ${code(y, c)}, ${code(z, c)})`
        if (type === 'conversion') {
                if (x === 'float') if (is.num(y)) return parseNumber(y) // @MEMO no conversion needed, e.g., float(1.0) → 1.0
                if (x === 'bool') if (is.bol(y)) return y ? 'true' : 'false'
                if (x === 'int') if (is.num(y)) return `${y << 0}`
                if (x === 'uint') if (is.num(y)) return `${y >>> 0}u`
                return `${getConversions(x, c)}(${parseArray(codeChildren(children.slice(1), c))})`
        }
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
                if ((x === 'texture' || x === 'texelFetch') && isX(y) && y.type === 'element') {
                        const [tn, ln] = y.props.children || []
                        if (isX(tn) && tn.type === 'uniformArray' && infer(tn, c) === 'texture') return parseTextureArray(c, x, code(tn, c), code(ln, c), code(z, c), w ? code(w, c) : undefined)
                }
                if (x === 'texture') return parseTexture(c, code(y, c), code(z, c), w ? code(w, c) : undefined)
                if (x === 'atan2' && c.isWebGL) return `atan(${code(y, c)}, ${code(z, c)})`
                if (c.isWebGL) {
                        if (x === 'fma') return `(${code(y, c)} * ${code(z, c)} + ${code(w, c)})` // @MEMO GLSL lacks fma builtin
                } else {
                        if (x === 'texelFetch') return `textureLoad(${code(y, c)}, ${code(z, c)}, ${code(w, c)})`
                        if (x === 'dFdx') return `dpdx(${code(y, c)})`
                        if (x === 'dFdy') return `dpdy(${code(y, c)})`
                }
                return `${x}(${parseArray(codeChildren(children.slice(1), c))})`
        }
        /**
         * scopes
         */
        if (type === 'scope') return codeChildren(children, c).join('\n')
        if (type === 'assign') return `${code(x, c)} = ${code(y, c)};`
        if (type === 'return') return `return ${code(x, c)};`
        if (type === 'break') return 'break;'
        if (type === 'continue') return 'continue;'
        if (type === 'loop') return parseLoop(c, code(x, c), code(y, c), infer(x, c), id)
        if (type === 'if') return parseIf(codeChildren(children, c))
        if (type === 'switch') return parseSwitch(codeChildren(children, c))
        if (type === 'declare') return parseDeclare(c, code(x, c), y?.props?.id, infer(x, c))
        if (type === 'define') {
                if (!c.headers.has(id)) {
                        const [scope, ...args] = children
                        const argParams: [string, C][] = []
                        for (let i = 0; i < args.length; i++) {
                                const input = props.layout?.inputs?.[i]
                                if (!input) argParams.push([`p${i}`, infer(args[i], c)])
                                else argParams.push([input.name, input.type === 'auto' ? infer(args[i], c) : input.type])
                        }
                        c.headers.set(id, parseDefine(c, id!, code(scope, c), infer(target, c), argParams))
                }
                return `${id}(${parseArray(children.slice(1).map((child) => code(child, c)))})`
        }
        if (type === 'struct') {
                if (!c.headers.has(id)) c.headers.set(id, parseStructHead(c, id, fields))
                if (!initialValues) return parseStruct(c, id, x.props.id)
                const ordered: string[] = []
                for (const key in fields) {
                        const val = initialValues[key]
                        if (val !== undefined && val !== null) ordered.push(code(val, c))
                }
                return parseStruct(c, id, x.props.id, ordered.join(', '))
        }
        /**
         * headers
         */
        if (type === 'varying') {
                if (c.vertOutputs.has(id)) return c.isWebGL ? `${id}` : c.label === 'frag' ? `in.${id}` : `out.${id}`
                const field = parseVaryingHead(c, id, infer(target, c))
                c.fragInputs.set(id, field)
                c.vertOutputs.set(id, field)
                c.vertVaryings.set(id, { node: x })
                return c.isWebGL ? `${id}` : c.label === 'frag' ? `in.${id}` : `out.${id}`
        }
        if (type === 'builtin') {
                if (c.isWebGL) return getBluiltin(c, id)
                if (id === 'position') return c.label === 'frag' ? 'in.position' : 'out.position'
                const field = `@builtin(${id}) ${id}: ${getConversions(infer(target, c), c)}`
                if (id === 'frag_depth' && c.label === 'frag') {
                        c.fragOutputs.set(id, field)
                        return `out.${id}`
                }
                if (c.label === 'compute') c.computeInputs.set(id, field)
                else if (c.label === 'frag') c.fragInputs.set(id, field)
                else if (c.label === 'vert') c.vertInputs.set(id, field)
                return `in.${id}`
        }
        if (type === 'attribute' || type === 'instance') {
                setupEvent(c, id, type, target, x)
                c.vertInputs.set(id, parseAttribHead(c, id, infer(target, c)))
                return c.isWebGL ? `${id}` : `in.${id}`
        }
        if (c.headers.has(id)) return id // @MEMO this guard must be after varying/builtin/attribute
        let head = ''
        if (type === 'uniformArray') {
                const varType = infer(target, c)
                setupEvent(c, id, varType, target, x)
                if (varType === 'texture') head = parseTextureArrayHead(c, id)
                else head = parseUniformArrayHead(c, id, varType, props.args?.[0])
        }
        // @TODO FIX
        if (type === 'instanceArray' || type === 'attributeArray') {
                setupEvent(c, id, type, target, x)
                head = parseAttributeArrayHead(c, id, infer(target, c))
        }
        if (type === 'uniform') {
                const varType = infer(target, c)
                setupEvent(c, id, varType, target, x)
                head = parseUniformHead(c, id, varType)
        }
        if (type === 'storage') {
                setupEvent(c, id, type, target, x)
                head = parseStorageHead(c, id, infer(target, c))
        }
        if (type === 'constant') head = parseConstantHead(c, id, infer(target, c), code(x, c))
        if (head) {
                c.headers.set(id, head)
                return id
        }
        return code(x, c)
}
