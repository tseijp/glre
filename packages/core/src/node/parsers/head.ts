import { infer } from '../infer'
import { formatConversions, isNodeProxy } from '../utils'
import type { Constants, NodeContext, X } from '../types'

export const parseUniformHead = (c: NodeContext, id: string, varType: Constants) => {
        const isTexture = varType === 'sampler2D' || varType === 'texture'
        if (c.isWebGL)
                return isTexture //
                        ? `uniform sampler2D ${id};`
                        : `uniform ${varType} ${id};`
        if (isTexture) {
                const { group = 1, binding = 0 } = c.webgpu?.textures.map.get(id) || {}
                return (
                        `@group(${group}) @binding(${binding}) var ${id}Sampler: sampler;\n` +
                        `@group(${group}) @binding(${binding + 1}) var ${id}: texture_2d<f32>;`
                )
        }
        const { group = 0, binding = 0 } = c.webgpu?.uniforms.map.get(id) || {}
        const wgslType = formatConversions(varType, c)
        return `@group(${group}) @binding(${binding}) var<uniform> ${id}: ${wgslType};`
}

export const parseConstantHead = (c: NodeContext, id: string, varType: Constants, value: string) => {
        return c.isWebGL
                ? `const ${varType} ${id} = ${value};`
                : `const ${id}: ${formatConversions(varType, c)} = ${value};`
}

export const parseAttribHead = (c: NodeContext, id: string, varType: Constants) => {
        if (c.isWebGL) return `in ${varType} ${id};`
        const { location = 0 } = c.webgpu?.attribs.map.get(id) || {}
        return `@location(${location}) ${id}: ${formatConversions(varType, c)}`
}

export const parseStructHead = (c: NodeContext, id: string, fields: Record<string, X>) => {
        let ret = ''
        if (c.isWebGL) {
                ret += `struct ${id} {\n`
                for (const key in fields) ret += `  ${infer(fields[key], c)} ${key};\n`
                ret += '};'
                return ret
        }
        ret = `struct ${id} {\n`
        let location = 0
        for (const key in fields) {
                const field = fields[key]
                const fieldType = infer(field, c)
                if (isNodeProxy(field) && field.type === 'builtin')
                        ret += `  @builtin(${field.props.id}) ${key}: ${formatConversions(fieldType, c)},\n`
                else {
                        ret += `  @location(${location}) ${key}: ${formatConversions(fieldType, c)},\n`
                        location++
                }
        }
        ret += '}'
        return ret
}
