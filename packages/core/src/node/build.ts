import { code, initNodeContext } from './utils'
import type { NodeContext, X } from './types'

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
        if (c.isWebGL && c.dependencies) {
                const sorted = topological(c.headers, c.dependencies)
                head = sorted.map(([, value]) => value).join('\n')
        } else head = Array.from(c.headers.values()).join('\n')
        let [lines, ret] = body.split('return ')
        if (ret) ret = ret.replace(';', '')
        else [lines, ret] = ['', body]
        return [head, lines.trim(), ret]
}

const generateStruct = (id: string, map: Map<string, string>) => {
        return `struct ${id} {\n  ${Array.from(map.values()).join(',\n  ')}\n}`
}

const PRECISION = ['float', 'int', 'sampler2D', 'samplerCube', 'sampler3D', 'sampler2DArray', 'sampler2DShadow', 'samplerCubeShadow', 'sampler2DArrayShadow', 'isampler2D', 'isampler3D', 'isamplerCube', 'isampler2DArray', 'usampler2D', 'usampler3D', 'usamplerCube', 'usampler2DArray']
const precisionHead = (result: string[], precision = 'highp') => {
        for (const key of PRECISION) result.push(`precision ${precision} ${key};`)
}

// ref: https://github.com/mrdoob/three.js/blob/master/src/renderers/webgl/WebGLCapabilities.js
const getMaxPrecision = (c?: WebGL2RenderingContext, precision = 'highp') => {
        if (!c) return 'highp'
        if (precision === 'highp') {
                const p0 = c.getShaderPrecisionFormat(c.VERTEX_SHADER, c.HIGH_FLOAT)
                const p1 = c.getShaderPrecisionFormat(c.FRAGMENT_SHADER, c.HIGH_FLOAT)
                if (p0 && p0.precision > 0 && p1 && p1.precision > 0) return 'highp'
                precision = 'mediump'
        }
        if (precision === 'mediump') {
                const p0 = c.getShaderPrecisionFormat(c.VERTEX_SHADER, c.MEDIUM_FLOAT)
                const p1 = c.getShaderPrecisionFormat(c.FRAGMENT_SHADER, c.MEDIUM_FLOAT)
                if (p0 && p0.precision > 0 && p1 && p1.precision > 0) return 'mediump'
        }
        return 'lowp'
}

export const fragment = (x: X, c = {} as NodeContext) => {
        initNodeContext(c)
        c.headers.clear()
        c.label = 'frag'
        const [head, lines, ret] = build(x, c)
        const result = []
        if (c.isWebGL) {
                result.push('#version 300 es')
                precisionHead(result, getMaxPrecision(c.gl?.context, c.gl?.precision))
                result.push('out vec4 fragColor;')
                for (const code of c.fragInputs.values()) result.push(`in ${code}`)
                result.push(head)
                result.push('void main() {')
                if (lines) result.push(`  ${lines}`)
                result.push(`  fragColor = ${ret};`)
        } else {
                if (c.fragInputs.size) result.push(generateStruct('In', c.fragInputs))
                const outFields = new Map([['color', '@location(0) color: vec4f'], ...c.fragOutputs])
                result.push(generateStruct('Out', outFields))
                result.push(head)
                result.push(`@fragment\nfn main(${c.fragInputs.size ? 'in: In' : ''}) -> Out {`)
                result.push('  var out: Out;')
                if (lines) result.push(`  ${lines}`)
                result.push(`  out.color = ${ret};\n  return out;`)
        }
        result.push('}')
        const main = result.filter(Boolean).join('\n').trim()
        if (c.gl?.isDebug) console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}

export const vertex = (x: X, c = {} as NodeContext) => {
        initNodeContext(c)
        c.headers.clear()
        c.label = 'vert'
        for (const [id, { node }] of c.vertVaryings.entries()) c.vertVaryings.set(id, { node, code: code(node, c) })
        const [head, lines, ret] = build(x, c)
        const result = []
        if (c.isWebGL) {
                result.push('#version 300 es')
                for (const code of c.vertInputs.values()) result.push(`in ${code}`)
                for (const code of c.vertOutputs.values()) result.push(`out ${code}`)
                result.push(head)
                result.push('void main() {')
                if (lines) result.push(`  ${lines}`)
                for (const [id, varying] of c.vertVaryings.entries()) if (varying.code && !lines.includes(`${id} =`)) result.push(`  ${id} = ${varying.code};`)
                result.push(`  gl_Position = ${ret};`)
        } else {
                if (c.vertInputs.size) result.push(generateStruct('In', c.vertInputs))
                if (c.vertOutputs.size) result.push(generateStruct('Out', c.vertOutputs))
                result.push(head)
                result.push('@vertex')
                result.push(`fn main(${c.vertInputs.size ? 'in: In' : ''}) -> Out {`)
                result.push('  var out: Out;')
                if (lines) result.push(`  ${lines}`)
                for (const [id, varying] of c.vertVaryings.entries()) if (varying.code && !lines.includes(`${id} =`)) result.push(`  out.${id} = ${varying.code};`)
                result.push(`  out.position = ${ret};`)
                result.push('  return out;')
        }
        result.push('}')
        const main = result.filter(Boolean).join('\n').trim()
        if (c.gl?.isDebug) console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}

export const compute = (x: X, c = {} as NodeContext) => {
        initNodeContext(c)
        c.headers.clear()
        c.label = 'compute'
        const [head, lines, ret] = build(x, c)
        const result = []
        if (c.isWebGL) {
                result.push('#version 300 es')
                precisionHead(result, 'highp')
                result.push(head)
                result.push('void main() {')
                if (lines) result.push(`  ${lines}`)
                result.push(`  ${ret};`)
                result.push('}')
        } else {
                if (c.computeInputs.size) result.push(generateStruct('In', c.computeInputs))
                result.push(head)
                result.push('@compute @workgroup_size(32)')
                result.push(`fn main(${c.computeInputs.size ? 'in: In' : ''}) {`)
                if (lines) result.push(`  ${lines}`)
                result.push(`  ${ret};`)
                result.push('}')
        }
        const main = result.filter(Boolean).join('\n').trim()
        if (c.gl?.isDebug) console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}
