import { is } from '../utils/helpers'
import { code } from './code'
import { infer } from './infer'
import { formatConversions } from './utils'
import type { Constants, NodeContext, NodeProps, NodeProxy, X } from './types'

export const parseArray = (children: X[], c: NodeContext) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => code(x, c))
                .join(', ')
}

export const parseTexture = (c: NodeContext, y: X, z: X, w: X) => {
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
export const parseIf = (c: NodeContext, x: X, y: X, children: X[]) => {
        let ret = `if (${code(x, c)}) {\n${code(y, c)}\n}`
        for (let i = 2; i < children.length; i += 2) {
                const isElse = i >= children.length - 1
                ret += !isElse
                        ? ` else if (${code(children[i], c)}) {\n${code(children[i + 1], c)}\n}`
                        : ` else {\n${code(children[i], c)}\n}`
        }
        return ret
}

export const parseSwitch = (c: NodeContext, x: X, children: X[]) => {
        let ret = `switch (${code(x, c)}) {\n`
        for (let i = 1; i < children.length; i += 2) {
                const isDefault = i >= children.length - 1
                if (isDefault && children.length % 2 === 0) {
                        ret += `default:\n${code(children[i], c)}\nbreak;\n`
                } else if (i + 1 < children.length)
                        ret += `case ${code(children[i], c)}:\n${code(children[i + 1], c)}\nbreak;\n`
        }
        ret += '}'
        return ret
}

export const parseDeclare = (c: NodeContext, x: X, y: X) => {
        const type = infer(x, c)
        const varName = (y as any)?.props?.id
        if (c.isWebGL) return `${type} ${varName} = ${code(x, c)};`
        const wgslType = formatConversions(type)
        return `var ${varName}: ${wgslType} = ${code(x, c)};`
}

export const parseDefine = (c: NodeContext, props: NodeProps, returnType: Constants | string) => {
        const { id, children = [], layout } = props
        const [x, ...args] = children
        const argParams: [name: string, type: string][] = []
        const params: string[] = []
        if (layout?.inputs)
                for (const input of layout.inputs) {
                        argParams.push([input.name, input.type])
                }
        else
                for (let i = 0; i < args.length; i++) {
                        argParams.push([`p${i}`, infer(args[i], c)])
                }
        const ret = []
        if (c?.isWebGL) {
                for (const [id, type] of argParams) params.push(`${type} ${id}`)
                ret.push(`${returnType} ${id}(${params}) {`)
        } else {
                for (const [id, type] of argParams) params.push(`${id}: ${formatConversions(type, c)}`)
                ret.push(`fn ${id}(${params}) -> ${formatConversions(returnType, c)} {`)
        }
        const scopeCode = code(x, c)
        if (scopeCode) ret.push(scopeCode)
        ret.push('}')
        return ret.join('\n')
}

export const parseStructHead = (c: NodeContext, id: string, fields: Record<string, NodeProxy> = {}) => {
        const lines: string[] = []
        for (const key in fields) {
                const fieldType = fields[key]
                const type = infer(fieldType, c)
                lines.push(c.isWebGL ? `${type} ${key};` : `${key}: ${formatConversions(type, c)},`)
        }
        const ret = lines.join('\n  ')
        return `struct ${id} {\n  ${ret}\n};`
}

export const parseStruct = (
        c: NodeContext,
        id: string,
        instanceId = '',
        fields?: Record<string, NodeProxy>,
        initialValues?: Record<string, NodeProxy>
) => {
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
 * headers
 */
export const parseVaryingHead = (c: NodeContext, id: string, type: string) => {
        return c.isWebGL ? `${type} ${id};` : `@location(${c.vertVaryings!.size}) ${id}: ${formatConversions(type, c)}`
}

export const parseUniformHead = (c: NodeContext, id: string, type: Constants) => {
        const isTexture = type === 'sampler2D' || type === 'texture'
        if (c.isWebGL)
                return isTexture //
                        ? `uniform sampler2D ${id};`
                        : `uniform ${type} ${id};`
        if (isTexture) {
                const { group = 1, binding = 0 } = c.gl?.webgpu?.textures.map.get(id) || {}
                return (
                        `@group(${group}) @binding(${binding}) var ${id}Sampler: sampler;\n` +
                        `@group(${group}) @binding(${binding + 1}) var ${id}: texture_2d<f32>;`
                )
        }
        const { group = 0, binding = 0 } = c.gl?.webgpu?.uniforms.map.get(id) || {}
        const wgslType = formatConversions(type, c)
        return `@group(${group}) @binding(${binding}) var<uniform> ${id}: ${wgslType};`
}

export const parseAttribHead = (c: NodeContext, id: string, type: Constants) => {
        if (c.isWebGL) return `${type} ${id};`
        const { location = 0 } = c.gl?.webgpu?.attribs.map.get(id) || {}
        const wgslType = formatConversions(type, c)
        return `@location(${location}) ${id}: ${wgslType}`
}

export const parseConstantHead = (c: NodeContext, id: string, type: Constants, value: string) => {
        return c.isWebGL ? `const ${type} ${id} = ${value};` : `const ${id}: ${formatConversions(type, c)} = ${value};`
}
