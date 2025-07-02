import { is } from '../utils/helpers'
import { infer } from './infer'
import { getBluiltin, getOperator, formatConversions, joins } from './utils'
import { SAMPLER_TYPES } from './const'
import type { NodeContext, X } from './types'

export const code = (target: X, c?: NodeContext | null): string => {
        if (!c) c = {}
        if (!c.headers) c.headers = new Map()
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
        const [x, y, z] = children
        /**
         * headers
         */
        let head = ''
        if (type === 'attribute') {
                if (!c.isWebGL) {
                        const varType = infer(target, c)
                        if (!c.arguments) c.arguments = new Map()
                        const { location } = c.webgpu?.attribs.map.get(id)!
                        c.arguments.set(id, { location, type: varType })
                        return id
                }
                if (c.headers.has(id)) return id
                head = `in ${infer(target, c)} ${id};`
        }
        if (type === 'uniform') {
                if (c.headers.has(id)) return id
                const varType = infer(target, c)
                if (c.isWebGL) {
                        head = `uniform ${varType} ${id};`
                } else {
                        if (SAMPLER_TYPES.includes(varType as any)) {
                                const { group, binding } = c.webgpu?.textures.map.get(id)!
                                const samplerBinding = binding * 2
                                const textureBinding = binding * 2 + 1
                                head = `@group(${group}) @binding(${samplerBinding}) var ${id}Sampler: sampler;\n`
                                head += `@group(${group}) @binding(${textureBinding}) var ${id}: texture_2d<f32>;`
                        } else {
                                const { group, binding } = c.webgpu?.uniforms.map.get(id)!
                                const wgslType = formatConversions(varType, c)
                                head = `@group(${group}) @binding(${binding}) var<uniform> ${id}: ${wgslType};`
                        }
                }
        }
        if (type === 'constant') {
                if (c.headers.has(id)) return id
                const varType = infer(target, c)
                const value = code(x, c)
                head = c.isWebGL
                        ? `const ${varType} ${id} = ${value};`
                        : `const ${id}: ${formatConversions(varType, c)} = ${value};`
        }
        if (type === 'varying') {
                if (c.headers.has(id)) return id
                head = `${infer(target, c)} ${id}`
        }
        if (head) {
                c.headers.set(id, head)
                c.onMount?.(id)
                return id
        }
        /**
         * variables
         */
        if (type === 'variable') return id
        if (type === 'swizzle') return `${code(y, c)}.${code(x, c)}`
        if (type === 'ternary') return `(${code(x, c)} ? ${code(y, c)} : ${code(z, c)})`
        if (type === 'builtin') return c?.isWebGL ? getBluiltin(id) : id
        if (type === 'conversion') {
                if (SAMPLER_TYPES.includes(x as any))
                        return `${formatConversions(x, c)}(${joins(children.slice(1), c)})`
                return `${formatConversions(x, c)}(${joins(children.slice(1), c)})`
        }
        if (type === 'operator') {
                if (x === 'not' || x === 'bitNot') return `!${code(y, c)}`
                return `(${code(y, c)} ${getOperator(x)} ${code(z, c)})`
        }
        if (type === 'function') {
                if (x === 'negate') return `(-${joins(children.slice(1), c)})`
                if (x === 'texture' && !c.isWebGL) {
                        const textureName = code(children[1], c)
                        const uvCoord = code(children[2], c)
                        return `textureSample(${textureName}, ${textureName}Sampler, ${uvCoord})`
                }
                return `${x}(${joins(children.slice(1), c)})`
        }
        /**
         * scopes
         */
        if (type === 'scope') {
                const scopeCode = joins(children, c, '\n')
                return scopeCode ? `{\n${scopeCode}\n}` : '{}'
        }
        if (type === 'assign') return `${code(x, c)} = ${code(y, c)};`
        if (type === 'loop') {
                const [condition, body] = children
                return `while (${code(condition, c)}) ${code(body, c)}`
        }
        if (type === 'define') {
                const { layout } = props
                const inputs = layout?.inputs?.map((i) => `${i.name}: ${formatConversions(i.type, c)}`).join(', ') || ''
                const returnType = layout?.type ? formatConversions(layout.type, c) : 'void'
                const bodyCode = joins(children, c, '\n')
                return c.isWebGL
                        ? `${layout?.type || 'void'} ${layout?.name}(${
                                  layout?.inputs?.map((i) => `${i.type} ${i.name}`).join(', ') || ''
                          }) {\n${bodyCode}\n}`
                        : `fn ${layout?.name}(${inputs}) -> ${returnType} {\n${bodyCode}\n}`
        }
        if (type === 'if') {
                const [condition, ifBody, elseBody] = children
                const condCode = code(condition, c)
                const ifCode = code(ifBody, c)
                const elseCode = elseBody ? ` else ${code(elseBody, c)}` : ''
                return `if (${condCode}) ${ifCode}${elseCode}`
        }
        if (type === 'switch') {
                const [condition, ...cases] = children
                const casesCode = cases.map((c) => code(c, c)).join('\n')
                return `switch(${code(condition, c)}) {\n${casesCode}\n}`
        }
        if (type === 'declare') {
                const varType = infer(x, c)
                const varName = code(x, c)
                const initValue = y ? ` = ${code(y, c)}` : ''
                return c.isWebGL
                        ? `${varType} ${varName}${initValue};`
                        : `var ${varName}: ${formatConversions(varType, c)}${initValue};`
        }
        if (type === 'return') return `return ${code(x, c)};`
        return ''
}
