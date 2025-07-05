import { infer } from './infer'
import { formatConversions, joins } from './utils'
import { code } from './code'
import type { Constants, NodeContext, NodeProps, X } from './types'

/**
 * varying
 */
export const parseVaryingHead = (c: NodeContext, direction: 'in' | 'out') => {
        const ret: string[] = []
        if (c.varyings) {
                for (const varying of c.varyings.values()) {
                        ret.push(`${direction} ${varying.type} v_${varying.id};`)
                }
        }
        return ret.join('\n')
}

export const parseVaryingMain = (c: NodeContext, stage: 'vertex' | 'fragment') => {
        const ret: string[] = []
        if (c.varyings) {
                for (const varying of c.varyings.values()) {
                        if (stage === 'vertex') {
                                ret.push(`  v_${varying.id} = ${varying.code};`)
                        }
                        // fragment stage doesn't need assignment code
                }
        }
        return ret.join('\n')
}

export const parseVaryingWGSL = (c: NodeContext, stage: 'vertex' | 'fragment') => {
        const ret: string[] = []
        if (c.varyings) {
                for (const varying of c.varyings.values()) {
                        if (stage === 'vertex') {
                                ret.push(`  out.${varying.id} = ${varying.code};`)
                        }
                        // fragment stage doesn't need assignment code
                }
        }
        return ret.join('\n')
}

export const generateWGSLStruct = (c: NodeContext) => {
        const fields = [`@builtin(position) position: vec4f`]
        if (c.varyings)
                for (const varying of c.varyings.values()) {
                        fields.push(
                                `@location(${varying.location}) ${varying.id}: ${formatConversions(varying.type, c)}`
                        )
                }
        return `struct Out {\n  ${fields.join(',\n  ')}\n}\n`
}

/**
 * headers
 */
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

export const parseAttribHead = (c: NodeContext, id: string, varType: Constants) => {
        if (c.isWebGL) return `in ${varType} ${id};`
        const { location = 0 } = c.webgpu?.attribs.map.get(id) || {}
        const wgslType = formatConversions(varType, c)
        return `@location(${location}) ${id}: ${wgslType}`
}

export const parseConstantHead = (c: NodeContext, id: string, varType: Constants, value: string) => {
        return c.isWebGL
                ? `const ${varType} ${id} = ${value};`
                : `const ${id}: ${formatConversions(varType, c)} = ${value};`
}

export const parseTexture = (c: NodeContext, y: X, z: X, w: X) => {
        if (c.isWebGL) {
                const args = w ? [y, z, w] : [y, z]
                return `texture(${joins(args, c)})`
        }
        const _y = code(y, c)
        const args = [_y, _y + 'Sampler', code(z, c)]
        if (!w) return `textureSample(${args})`
        args.push(code(w, c))
        return `textureSampleLevel(${args})`
}

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
        const varType = infer(x, c)
        const varName = (y as any)?.props?.id
        if (c.isWebGL) return `${varType} ${varName} = ${code(x, c)};`
        const wgslType = formatConversions(varType)
        return `var ${varName}: ${wgslType} = ${code(x, c)};`
}

export const parseDefine = (c: NodeContext, props: NodeProps, returnType: Constants) => {
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
