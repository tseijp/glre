import { code } from './utils'
import { is } from '../utils/helpers'
import type { NodeContext, X } from './types'

const GLSL_FRAGMENT_HEAD = `
#version 300 es
precision mediump float;
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

const generateHead = (x: X, c: NodeContext) => {
        const body = code(x, c)
        let head = ''
        if (c.isWebGL && c.code?.dependencies) {
                const sorted = topological(c.code.headers, c.code.dependencies)
                head = sorted.map(([, value]) => value).join('\n')
        } else head = Array.from(c.code?.headers?.values() || []).join('\n')
        return [head, body]
}

const generateStruct = (id: string, map: Map<string, string>) => {
        return `struct ${id} {\n  ${Array.from(map.values()).join(',\n  ')}\n}`
}

export const fragment = (x: X, c: NodeContext) => {
        if (is.str(x)) return x.trim()
        c.code?.headers?.clear()
        c.label = 'frag' // for varying inputs or outputs
        const [head, body] = generateHead(x, c)
        const ret = []
        if (c.isWebGL) {
                ret.push(GLSL_FRAGMENT_HEAD)
                for (const code of c.code?.fragInputs?.values() || []) ret.push(`in ${code}`)
                ret.push(head)
                ret.push(`void main() {\n  fragColor = ${body};`)
        } else {
                if (c.code?.fragInputs?.size) ret.push(generateStruct('Out', c.code.fragInputs))
                ret.push(head)
                ret.push(`@fragment\nfn main(out: Out) -> @location(0) vec4f {`)
                ret.push(`  return ${body};`)
        }
        ret.push('}')
        const main = ret.filter(Boolean).join('\n').trim()
        // console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}

export const vertex = (x: X, c: NodeContext) => {
        if (is.str(x)) return x.trim()
        c.code?.headers?.clear()
        c.label = 'vert' // for varying inputs or outputs
        const [head, body] = generateHead(x, c)
        const ret = []
        if (c.isWebGL) {
                ret.push('#version 300 es')
                for (const code of c.code?.vertInputs?.values() || []) ret.push(`in ${code}`)
                for (const code of c.code?.vertOutputs?.values() || []) ret.push(`out ${code}`)
                ret.push(head)
                ret.push('void main() {')
                ret.push(`  gl_Position = ${body};`)
                for (const [id, code] of c.code?.vertVaryings?.entries() || []) ret.push(`  ${id} = ${code};`)
        } else {
                if (c.code?.vertInputs?.size) ret.push(generateStruct('In', c.code.vertInputs))
                if (c.code?.vertOutputs?.size) ret.push(generateStruct('Out', c.code.vertOutputs))
                ret.push(head)
                ret.push('@vertex')
                ret.push(`fn main(${c.code?.vertInputs?.size ? 'in: In' : ''}) -> Out {`)
                ret.push('  var out: Out;')
                ret.push(`  out.position = ${body};`)
                for (const [id, code] of c.code?.vertVaryings?.entries() || []) ret.push(`  out.${id} = ${code};`)
                ret.push('  return out;')
        }
        ret.push('}')
        const main = ret.filter(Boolean).join('\n').trim()
        // console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}

export const compute = (x: X, c: NodeContext) => {
        if (is.str(x)) return x.trim()
        if (c.isWebGL) return '' // ignore WebGL compute shaders
        c.code?.headers?.clear()
        c.label = 'compute'
        const [head, body] = generateHead(x, c)
        const ret = []
        if (c.code?.computeInputs?.size) ret.push(generateStruct('In', c.code.computeInputs))
        ret.push(head)
        ret.push('@compute @workgroup_size(32)')
        ret.push(`fn main(${c.code?.computeInputs?.size ? 'in: In' : ''}) {`)
        ret.push(`  ${body};`)
        ret.push('}')
        const main = ret.filter(Boolean).join('\n').trim()
        // console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}
