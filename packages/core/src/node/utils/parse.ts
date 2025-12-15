import { code } from '.'
import { infer } from './infer'
import { getConversions, addDependency } from './utils'
import { is } from '../../helpers'
import type { Constants, NodeContext, NodeProps, StructFields, Y } from '../types'
import { storageSize } from '../../webgl/utils'

export const parseArray = (children: Y[], c: NodeContext) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => code(x, c))
                .join(', ')
}

// only for webgl
export const parseGather = (c: NodeContext, x: Y, y: Y, target: Y) => {
        const parseSwizzle = () => {
                const valueType = infer(target, c)
                if (valueType === 'float') return '.x'
                if (valueType === 'vec2') return '.xy'
                if (valueType === 'vec3') return '.xyz'
                if (valueType === 'vec4') return ''
                throw new Error(`Unsupported storage scatter type: ${valueType}`)
        }
        const indexVar = code(y, c)
        const size = storageSize(c.gl?.particleCount)
        const coordX = `int(${indexVar}) % ${size.x}`
        const coordY = `int(${indexVar}) / ${size.x}`
        return `texelFetch(${code(x, c)}, ivec2(${coordX}, ${coordY}), 0)${parseSwizzle()}`
}

// only for webgl
export const parseScatter = (c: NodeContext, storageNode: Y, valueNode: Y) => {
        const storageId = code(storageNode, c)
        const valueCode = code(valueNode, c)
        const valueType = infer(valueNode, c)
        if (valueType === 'float') return `_${storageId} = vec4(${valueCode}, 0.0, 0.0, 1.0);`
        if (valueType === 'vec2') return `_${storageId} = vec4(${valueCode}, 0.0, 1.0);`
        if (valueType === 'vec3') return `_${storageId} = vec4(${valueCode}, 1.0);`
        if (valueType === 'vec4') return `_${storageId} = ${valueCode};`
        throw new Error(`Unsupported storage scatter type: ${valueType}`)
}

export const parseTexture = (c: NodeContext, y: Y, z: Y, w: Y) => {
        if (c.isWebGL) {
                const args = w ? [y, z, w] : [y, z]
                return `texture(${parseArray(args, c)})`
        }
        const _y = code(y, c)
        const args = [_y, _y + 'Sampler', code(z, c)]
        if (!w) return `textureSample(${args})`
        args.push(code(w, c))
        return `textureSampleLevel(${args})`
}

/**
 * scopes
 */
export const parseIf = (c: NodeContext, x: Y, y: Y, children: Y[]) => {
        let ret = `if (${code(x, c)}) {\n${code(y, c)}\n}`
        for (let i = 2; i < children.length; i += 2) {
                const isElse = i >= children.length - 1
                ret += !isElse ? ` else if (${code(children[i], c)}) {\n${code(children[i + 1], c)}\n}` : ` else {\n${code(children[i], c)}\n}`
        }
        return ret
}

export const parseSwitch = (c: NodeContext, x: Y, children: Y[]) => {
        let ret = `switch (${code(x, c)}) {\n`
        for (let i = 1; i < children.length; i += 2) {
                const isDefault = i >= children.length - 1
                if (isDefault && children.length % 2 === 0) {
                        ret += `default:\n${code(children[i], c)}\nbreak;\n`
                } else if (i + 1 < children.length) ret += `case ${code(children[i], c)}:\n${code(children[i + 1], c)}\nbreak;\n`
        }
        ret += '}'
        return ret
}

export const parseDeclare = (c: NodeContext, x: Y, y: Y) => {
        const type = infer(x, c)
        const varName = (y as any)?.props?.id
        if (c.isWebGL) return `${type} ${varName} = ${code(x, c)};`
        const wgslType = getConversions(type)
        return `var ${varName}: ${wgslType} = ${code(x, c)};`
}

export const parseStructHead = (c: NodeContext, id: string, fields: StructFields = {}) => {
        c.code?.structStructFields?.set(id, fields)
        const lines: string[] = []
        for (const key in fields) {
                const fieldType = fields[key]
                const type = infer(fieldType, c)
                if (c.isWebGL) addDependency(c, id, type)
                lines.push(c.isWebGL ? `${type} ${key};` : `${key}: ${getConversions(type, c)},`)
        }
        const ret = lines.join('\n  ')
        return `struct ${id} {\n  ${ret}\n};`
}

export const parseStruct = (c: NodeContext, id: string, instanceId = '', initialValues?: StructFields) => {
        const fields = c.code?.structStructFields?.get(id) || {}
        if (c.isWebGL) {
                if (initialValues) {
                        const ordered = []
                        for (const key in fields) ordered.push(initialValues[key])
                        return `${id} ${instanceId} = ${id}(${parseArray(ordered, c)});`
                } else return `${id} ${instanceId};`
        } else {
                if (initialValues) {
                        const ordered = []
                        for (const key in fields) ordered.push(initialValues[key])
                        return `var ${instanceId}: ${id} = ${id}(${parseArray(ordered, c)});`
                } else return `var ${instanceId}: ${id};`
        }
}

/**
 * define
 */
export const parseDefine = (c: NodeContext, props: NodeProps, target: Y) => {
        const { id, children = [], layout } = props
        const [x, ...args] = children
        const argParams: [name: string, type: Constants][] = []
        const params: string[] = []
        for (let i = 0; i < args.length; i++) {
                const input = layout?.inputs?.[i]
                if (!input) argParams.push([`p${i}`, infer(args[i], c)])
                else argParams.push([input.name, input.type === 'auto' ? infer(args[i], c) : input.type])
        }
        const scopeCode = code(x, c) // build struct headers before inferring returnType
        const returnType = infer(target, c)
        const ret = []
        if (c?.isWebGL) {
                for (const [paramId, type] of argParams) {
                        addDependency(c, id!, type)
                        params.push(`${type} ${paramId}`)
                }
                addDependency(c, id!, returnType)
                ret.push(`${returnType} ${id}(${params}) {`)
        } else {
                for (const [paramId, type] of argParams) params.push(`${paramId}: ${getConversions(type, c)}`)
                const isVoid = returnType === 'void'
                if (isVoid) {
                        ret.push(`fn ${id}(${params}) {`)
                } else ret.push(`fn ${id}(${params}) -> ${getConversions(returnType, c)} {`)
        }
        if (scopeCode) ret.push(scopeCode)
        ret.push('}')
        return ret.join('\n')
}

/**
 * headers
 */
export const parseVaryingHead = (c: NodeContext, id: string, type: Constants) => {
        return c.isWebGL ? `${type} ${id};` : `@location(${c.code?.vertVaryings?.size || 0}) ${id}: ${getConversions(type, c)}`
}

export const parseAttribHead = (c: NodeContext, id: string, type: Constants) => {
        if (c.isWebGL) return `${type} ${id};`
        const { location = 0 } = c.gl?.webgpu?.attribs.map.get(id) || {}
        const wgslType = getConversions(type, c)
        return `@location(${location}) ${id}: ${wgslType}`
}

export const parseUniformHead = (c: NodeContext, id: string, type: Constants) => {
        const isTexture = type === 'sampler2D' || type === 'texture'
        if (c.isWebGL)
                return isTexture //
                        ? `uniform sampler2D ${id};`
                        : `uniform ${type} ${id};`
        if (isTexture) {
                const { group = 1, binding = 0 } = c.gl?.webgpu?.textures.map.get(id) || {}
                return `@group(${group}) @binding(${binding}) var ${id}Sampler: sampler;\n` + `@group(${group}) @binding(${binding + 1}) var ${id}: texture_2d<f32>;`
        }
        const { group = 0, binding = 0 } = c.gl?.webgpu?.uniforms.map.get(id) || {}
        const wgslType = getConversions(type, c)
        return `@group(${group}) @binding(${binding}) var<uniform> ${id}: ${wgslType};`
}

export const parseStorageHead = (c: NodeContext, id: string, type: Constants) => {
        if (c.isWebGL) {
                const ret = `uniform sampler2D ${id};`
                if (c.label !== 'compute') return ret
                const location = c.units?.(id)
                return `${ret}\nlayout(location = ${location}) out vec4 _${id};` // out texture buffer
        }
        const { group = 0, binding = 0 } = c.gl?.webgpu?.storages.map.get(id) || {}
        const wgslType = getConversions(type, c)
        return `@group(${group}) @binding(${binding}) var<storage, read_write> ${id}: array<${wgslType}>;`
}

export const parseLoop = (c: NodeContext, x: Y, y: Y, id: string) => {
        const conditionType = infer(x, c)
        const bodyCode = code(y, c)
        const conditionCode = code(x, c)
        if (c.isWebGL) {
                if (conditionType === 'int') return `for (int ${id} = 0; ${id} < ${conditionCode}; ${id} += 1) {\n${bodyCode}\n}`
                if (conditionType === 'float') return `for (float ${id} = 0.0; ${id} < ${conditionCode}; ${id} += 1.0) {\n${bodyCode}\n}`
                if (conditionType === 'vec2') return `for (vec2 ${id} = vec2(0.0); ${id}.x < ${conditionCode}.x && ${id}.y < ${conditionCode}.y; ${id} += vec2(1.0)) {\n${bodyCode}\n}`
                if (conditionType === 'vec3') return `for (vec3 ${id} = vec3(0.0); ${id}.x < ${conditionCode}.x && ${id}.y < ${conditionCode}.y && ${id}.z < ${conditionCode}.z; ${id} += vec3(1.0)) {\n${bodyCode}\n}`
                return `for (int ${id} = 0; ${id} < ${conditionCode}; ${id} += 1) {\n${bodyCode}\n}`
        }
        if (conditionType === 'int') return `for (var ${id}: i32 = 0; ${id} < ${conditionCode}; ${id}++) {\n${bodyCode}\n}`
        if (conditionType === 'float') return `for (var ${id}: f32 = 0.0; ${id} < ${conditionCode}; ${id} += 1.0) {\n${bodyCode}\n}`
        if (conditionType === 'vec2') return `for (var ${id}: vec2f = vec2f(0.0); ${id}.x < ${conditionCode}.x && ${id}.y < ${conditionCode}.y; ${id} += vec2f(1.0)) {\n${bodyCode}\n}`
        if (conditionType === 'vec3') return `for (var ${id}: vec3f = vec3f(0.0); ${id}.x < ${conditionCode}.x && ${id}.y < ${conditionCode}.y && ${id}.z < ${conditionCode}.z; ${id} += vec3f(1.0)) {\n${bodyCode}\n}`
        return `for (var ${id}: i32 = 0; ${id} < ${conditionCode}; ${id}++) {\n${bodyCode}\n}`
}

export const parseConstantHead = (c: NodeContext, id: string, type: Constants, value: string) => {
        return c.isWebGL ? `const ${type} ${id} = ${value};` : `const ${id}: ${getConversions(type, c)} = ${value};`
}
