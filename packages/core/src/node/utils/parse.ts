import { infer } from './infer'
import { getConversions, addDependency } from './utils'
import { storageSize } from '../../webgl/utils'
import type { Constants, NodeContext, StructFields } from '../types'

export const parseArray = (items: string[]) => items.filter(Boolean).join(', ')

// only for webgl
export const parseGather = (c: NodeContext, storage: string, index: string, type: Constants) => {
        const parseSwizzle = () => {
                if (type === 'float') return '.x'
                if (type === 'vec2') return '.xy'
                if (type === 'vec3') return '.xyz'
                if (type === 'vec4') return ''
                throw new Error(`Unsupported storage scatter type: ${type}`)
        }
        const size = storageSize(c.gl?.particleCount)
        const coordX = `int(${index}) % ${size.x}`
        const coordY = `int(${index}) / ${size.x}`
        return `texelFetch(${storage}, ivec2(${coordX}, ${coordY}), 0)${parseSwizzle()}`
}

// only for webgl
export const parseScatter = (storage: string, value: string, type: Constants) => {
        if (type === 'float') return `_${storage} = vec4(${value}, 0.0, 0.0, 1.0);`
        if (type === 'vec2') return `_${storage} = vec4(${value}, 0.0, 1.0);`
        if (type === 'vec3') return `_${storage} = vec4(${value}, 1.0);`
        if (type === 'vec4') return `_${storage} = ${value};`
        throw new Error(`Unsupported storage scatter type: ${type}`)
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

export const parseDeclare = (c: NodeContext, value: string, varName: string, type: Constants) => {
        if (c.isWebGL) return `${type} ${varName} = ${value};`
        const wgslType = getConversions(type)
        return `var ${varName}: ${wgslType} = ${value};`
}

export const parseStruct = (c: NodeContext, id: string, instanceId = '', fields?: string) => {
        const hasInit = fields !== undefined
        if (c.isWebGL) {
                if (hasInit) return `${id} ${instanceId} = ${id}(${fields});`
                return `${id} ${instanceId};`
        }
        if (hasInit) return `var ${instanceId}: ${id} = ${id}(${fields});`
        return `var ${instanceId}: ${id};`
}

/**
 * define
 */
export const parseDefine = (c: NodeContext, id: string, scope: string, returnType: Constants, argParams: [string, Constants][]) => {
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
        if (scope) ret.push(scope)
        ret.push('}')
        return ret.join('\n')
}

/**
 * headers
 */
export const parseStructHead = (c: NodeContext, id: string, fields: StructFields = {}) => {
        c.structStructFields.set(id, fields)
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
        return c.isWebGL ? `${type} ${id};` : `@location(${c.vertVaryings.size || 0}) ${id}: ${getConversions(type, c)}`
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

export const parseLoop = (c: NodeContext, n: string, body: string, type: Constants, id: string) => {
        if (c.isWebGL) {
                if (type === 'int') return `for (int ${id} = 0; ${id} < ${n}; ${id} += 1) {\n${body}\n}`
                if (type === 'float') return `for (float ${id} = 0.0; ${id} < ${n}; ${id} += 1.0) {\n${body}\n}`
                if (type === 'vec2') return `for (vec2 ${id} = vec2(0.0); ${id}.x < ${n}.x && ${id}.y < ${n}.y; ${id} += vec2(1.0)) {\n${body}\n}`
                if (type === 'vec3') return `for (vec3 ${id} = vec3(0.0); ${id}.x < ${n}.x && ${id}.y < ${n}.y && ${id}.z < ${n}.z; ${id} += vec3(1.0)) {\n${body}\n}`
                return `for (int ${id} = 0; ${id} < ${n}; ${id} += 1) {\n${body}\n}`
        }
        if (type === 'int') return `for (var ${id}: i32 = 0; ${id} < ${n}; ${id}++) {\n${body}\n}`
        if (type === 'float') return `for (var ${id}: f32 = 0.0; ${id} < ${n}; ${id} += 1.0) {\n${body}\n}`
        if (type === 'vec2') return `for (var ${id}: vec2f = vec2f(0.0); ${id}.x < ${n}.x && ${id}.y < ${n}.y; ${id} += vec2f(1.0)) {\n${body}\n}`
        if (type === 'vec3') return `for (var ${id}: vec3f = vec3f(0.0); ${id}.x < ${n}.x && ${id}.y < ${n}.y && ${id}.z < ${n}.z; ${id} += vec3f(1.0)) {\n${body}\n}`
        return `for (var ${id}: i32 = 0; ${id} < ${n}; ${id}++) {\n${body}\n}`
}

export const parseConstantHead = (c: NodeContext, id: string, type: Constants, value: string) => {
        return c.isWebGL ? `const ${type} ${id} = ${value};` : `const ${id}: ${getConversions(type, c)} = ${value};`
}
