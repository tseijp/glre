import { infer } from './infer'
import { getConversions, addDependency } from './utils'
import { storageSize } from '../../webgl/utils'
import type { Constants, NodeContext, StructFields } from '../types'

export const parseArray = (items: string[]) => items.filter(Boolean).join(', ')

// only for webgl
export const parseGather = (c: NodeContext, storageCode: string, indexCode: string, valueType: Constants) => {
        const parseSwizzle = () => {
                if (valueType === 'float') return '.x'
                if (valueType === 'vec2') return '.xy'
                if (valueType === 'vec3') return '.xyz'
                if (valueType === 'vec4') return ''
                throw new Error(`Unsupported storage scatter type: ${valueType}`)
        }
        const size = storageSize(c.gl?.particleCount)
        const coordX = `int(${indexCode}) % ${size.x}`
        const coordY = `int(${indexCode}) / ${size.x}`
        return `texelFetch(${storageCode}, ivec2(${coordX}, ${coordY}), 0)${parseSwizzle()}`
}

// only for webgl
export const parseScatter = (storageCode: string, valueCode: string, valueType: Constants) => {
        if (valueType === 'float') return `_${storageCode} = vec4(${valueCode}, 0.0, 0.0, 1.0);`
        if (valueType === 'vec2') return `_${storageCode} = vec4(${valueCode}, 0.0, 1.0);`
        if (valueType === 'vec3') return `_${storageCode} = vec4(${valueCode}, 1.0);`
        if (valueType === 'vec4') return `_${storageCode} = ${valueCode};`
        throw new Error(`Unsupported storage scatter type: ${valueType}`)
}

export const parseTexture = (c: NodeContext, y: string, z: string, w?: string) => {
        if (c.isWebGL) {
                const args = w ? [y, z, w] : [y, z]
                return `texture(${args.join(', ')})`
        }
        const args = [y, y + 'Sampler', z]
        if (!w) return `textureSample(${args})`
        args.push(w)
        return `textureSampleLevel(${args})`
}

export const parseTextureArray = (c: NodeContext, fn: string, tex: string, layer: string, coord: string, lod?: string) => {
        if (fn === 'texelFetch') {
                const _lod = lod || '0'
                if (c.isWebGL) return `texelFetch(${tex}, ivec3(${coord}, ${layer}), ${_lod})`
                return `textureLoad(${tex}, ${coord}, ${layer}, ${_lod})`
        }
        if (c.isWebGL) {
                if (lod) return `textureLod(${tex}, vec3(${coord}, float(${layer})), ${lod})`
                return `texture(${tex}, vec3(${coord}, float(${layer})))`
        }
        if (lod) return `textureSampleLevel(${tex}, ${tex}Sampler, ${coord}, ${layer}, ${lod})`
        return `textureSample(${tex}, ${tex}Sampler, ${coord}, ${layer})`
}

/**
 * scopes
 */
export const parseIf = (codes: string[]) => {
        let ret = `if (${codes[0]}) {\n${codes[1]}\n}`
        for (let i = 2; i < codes.length; i += 2) {
                const isElse = i >= codes.length - 1
                ret += !isElse ? ` else if (${codes[i]}) {\n${codes[i + 1]}\n}` : ` else {\n${codes[i]}\n}`
        }
        return ret
}

export const parseSwitch = (codes: string[]) => {
        let ret = `switch (${codes[0]}) {\n`
        for (let i = 1; i < codes.length; i += 2) {
                const isDefault = i >= codes.length - 1
                if (isDefault && codes.length % 2 === 0) {
                        ret += `default:\n${codes[i]}\nbreak;\n`
                } else if (i + 1 < codes.length) ret += `case ${codes[i]}:\n${codes[i + 1]}\nbreak;\n`
        }
        ret += '}'
        return ret
}

export const parseDeclare = (c: NodeContext, valueCode: string, varName: string, type: Constants) => {
        if (c.isWebGL) return `${type} ${varName} = ${valueCode};`
        const wgslType = getConversions(type)
        return `var ${varName}: ${wgslType} = ${valueCode};`
}

export const parseStruct = (c: NodeContext, id: string, instanceId = '', fieldCodes?: string) => {
        const hasInit = fieldCodes !== undefined
        if (c.isWebGL) {
                if (hasInit) return `${id} ${instanceId} = ${id}(${fieldCodes});`
                return `${id} ${instanceId};`
        }
        if (hasInit) return `var ${instanceId}: ${id} = ${id}(${fieldCodes});`
        return `var ${instanceId}: ${id};`
}

/**
 * define
 */
export const parseDefine = (c: NodeContext, id: string, scopeCode: string, returnType: Constants, argParams: [string, Constants][]) => {
        const params: string[] = []
        const ret = []
        if (c?.isWebGL) {
                for (const [paramId, type] of argParams) {
                        addDependency(c, id, type)
                        params.push(`${type} ${paramId}`)
                }
                addDependency(c, id, returnType)
                ret.push(`${returnType} ${id}(${params}) {`)
        } else {
                for (const [paramId, type] of argParams) params.push(`${paramId}: ${getConversions(type, c)}`)
                const isVoid = returnType === 'void'
                if (isVoid) ret.push(`fn ${id}(${params}) {`)
                else ret.push(`fn ${id}(${params}) -> ${getConversions(returnType, c)} {`)
        }
        if (scopeCode) ret.push(scopeCode)
        ret.push('}')
        return ret.join('\n')
}

/**
 * headers
 */
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

export const parseVaryingHead = (c: NodeContext, id: string, type: Constants) => {
        return c.isWebGL ? `${type} ${id};` : `@location(${c.code?.vertVaryings?.size || 0}) ${id}: ${getConversions(type, c)}`
}

export const parseAttribHead = (c: NodeContext, id: string, type: Constants) => {
        if (c.isWebGL) return `${type} ${id};`
        const { location = 0 } = c.gl?.binding?.attrib(id) || {}
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
                const { group = 1, binding = 0 } = c.gl?.binding?.texture(id) || {}
                return `@group(${group}) @binding(${binding}) var ${id}Sampler: sampler;\n` + `@group(${group}) @binding(${binding + 1}) var ${id}: texture_2d<f32>;`
        }
        const { group = 0, binding = 0 } = c.gl?.binding?.uniform(id) || {}
        const wgslType = getConversions(type, c)
        return `@group(${group}) @binding(${binding}) var<uniform> ${id}: ${wgslType};`
}

// @TODO FIX
export const parseAttributeArrayHead = (c: NodeContext, id: string, type: Constants) => {
        if (c.isWebGL) return `uniform sampler2D ${id};`
        const { group = 0, binding = 0 } = c.gl?.binding?.storage(id) || {}
        const wgslType = getConversions(type, c)
        return `@group(${group}) @binding(${binding}) var<storage, read> ${id}: array<${wgslType}>;`
}

export const parseTextureArrayHead = (c: NodeContext, id: string) => {
        if (c.isWebGL) return `uniform sampler2DArray ${id};`
        const { group = 1, binding = 0 } = c.gl?.binding?.texture(id) || {}
        return `@group(${group}) @binding(${binding}) var ${id}Sampler: sampler;\n@group(${group}) @binding(${binding + 1}) var ${id}: texture_2d_array<f32>;`
}

export const parseUniformArrayHead = (c: NodeContext, id: string, type: Constants, count = 0) => {
        if (c.isWebGL) {
                const countStr = count ? `[${count}]` : '[]'
                return `uniform ${type} ${id}${countStr};`
        }
        const { group = 0, binding = 0 } = c.gl?.binding?.uniform(id) || {}
        const wgslType = getConversions(type, c)
        const countStr = count ? `, ${count}` : ''
        return `@group(${group}) @binding(${binding}) var<uniform> ${id}: array<${wgslType}${countStr}>;`
}

export const parseStorageHead = (c: NodeContext, id: string, type: Constants) => {
        if (c.isWebGL) {
                const ret = `uniform sampler2D ${id};`
                if (c.label !== 'compute') return ret
                const location = c.units?.(id)
                return `${ret}\nlayout(location = ${location}) out vec4 _${id};`
        }
        const { group = 0, binding = 0 } = c.gl?.binding?.storage(id) || {}
        const wgslType = getConversions(type, c)
        return `@group(${group}) @binding(${binding}) var<storage, read_write> ${id}: array<${wgslType}>;`
}

export const parseLoop = (c: NodeContext, conditionCode: string, bodyCode: string, conditionType: Constants, id: string) => {
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
