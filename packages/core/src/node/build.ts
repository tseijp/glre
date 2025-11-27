import { code } from './utils'
import type { NodeContext, X } from './types'

const GLSL_FRAGMENT_HEAD = `
#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
`.trim()

const topological = (headers: Map<string, string>, dependencies: Map<string, Set<string>>) => {
        const sorted: [string, string][] = []
        const visited = new Set<string>()
        const visiting = new Set<string>()
        const visit = (id: string) => {
                if (visiting.has(id)) return
                if (visited.has(id)) return
                visiting.add(id)
                const deps = dependencies.get(id) || new Set()
                for (const dep of deps) if (headers.has(dep)) visit(dep)
                visiting.delete(id)
                visited.add(id)
                if (headers.has(id)) sorted.push([id, headers.get(id)!])
        }
        for (const [id] of headers) visit(id)
        return sorted
}

const build = (x: X, c: NodeContext) => {
        const body = code(x, c)
        let head = ''
        if (c.isWebGL && c.code?.dependencies) {
                const sorted = topological(c.code.headers, c.code.dependencies)
                head = sorted.map(([, value]) => value).join('\n')
        } else head = Array.from(c.code?.headers?.values() || []).join('\n')
        let [lines, ret] = body.split('return ')
        if (ret) ret = ret.replace(';', '')
        else [lines, ret] = ['', body]
        return [head, lines.trim(), ret]
}

const generateStruct = (id: string, map: Map<string, string>) => {
        return `struct ${id} {\n  ${Array.from(map.values()).join(',\n  ')}\n}`
}

export const fragment = (x: X, c: NodeContext = {}) => {
        c.code?.headers?.clear()
        c.label = 'frag' // for varying inputs or outputs
        const [head, lines, ret] = build(x, c)
        const result = []
        if (c.isWebGL) {
                result.push(GLSL_FRAGMENT_HEAD)
                for (const code of c.code?.fragInputs?.values() || []) result.push(`in ${code}`)
                result.push(head)
                result.push('void main() {')
                result.push(`  ${lines}`)
                result.push(`  fragColor = ${ret};`)
        } else {
                if (c.code?.fragInputs?.size) result.push(generateStruct('Out', c.code.fragInputs))
                result.push(head)
                result.push(`@fragment\nfn main(out: Out) -> @location(0) vec4f {`)
                result.push(`  ${lines}`)
                result.push(`  return ${ret};`)
        }
        result.push('}')
        const main = result.filter(Boolean).join('\n').trim()
        if (c.gl?.isDebug) console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}

export const vertex = (x: X, c: NodeContext = {}) => {
        c.code?.headers?.clear()
        c.label = 'vert' // for varying inputs or outputs
        const [head, lines, ret] = build(x, c)
        const result = []
        if (c.isWebGL) {
                result.push('#version 300 es')
                for (const code of c.code?.vertInputs?.values() || []) result.push(`in ${code}`)
                for (const code of c.code?.vertOutputs?.values() || []) result.push(`out ${code}`)
                result.push(head)
                result.push('void main() {')
                result.push(`  ${lines}`)
                result.push(`  gl_Position = ${ret};`)
                for (const [id, code] of c.code?.vertVaryings?.entries() || []) result.push(`  ${id} = ${code};`)
        } else {
                if (c.code?.vertInputs?.size) result.push(generateStruct('In', c.code.vertInputs))
                if (c.code?.vertOutputs?.size) result.push(generateStruct('Out', c.code.vertOutputs))
                result.push(head)
                result.push('@vertex')
                result.push(`fn main(${c.code?.vertInputs?.size ? 'in: In' : ''}) -> Out {`)
                result.push('  var out: Out;')
                result.push(`  ${lines}`)
                result.push(`  out.position = ${ret};`)
                for (const [id, code] of c.code?.vertVaryings?.entries() || []) result.push(`  out.${id} = ${code};`)
                result.push('  return out;')
        }
        result.push('}')
        const main = result.filter(Boolean).join('\n').trim()
        if (c.gl?.isDebug) console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}

export const compute = (x: X, c: NodeContext = {}) => {
        c.code?.headers?.clear()
        c.label = 'compute'
        const [head, lines, ret] = build(x, c)
        const result = []
        if (c.isWebGL) {
                result.push('#version 300 es')
                result.push('precision highp float;')
                result.push('precision highp int;')
                result.push(head)
                result.push('void main() {')
                result.push(`  ${lines}`)
                result.push(`  ${ret};`)
                result.push('}')
        } else {
                if (c.code?.computeInputs?.size) result.push(generateStruct('In', c.code.computeInputs))
                result.push(head)
                result.push('@compute @workgroup_size(32)')
                result.push(`fn main(${c.code?.computeInputs?.size ? 'in: In' : ''}) {`)
                result.push(`  ${lines}`)
                result.push(`  ${ret};`)
                result.push('}')
        }
        const main = result.filter(Boolean).join('\n').trim()
        if (c.gl?.isDebug) console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}
