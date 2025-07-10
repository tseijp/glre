import { is } from '../utils/helpers'
import { code } from './code'
import { builtin, conversion as c, function_ as f, uniform as u } from './node'
import { hex2rgb, sortHeadersByDependencies } from './utils'
import type { Constants, NodeContext, X, NodeProxy } from './types'
export * from './code'
export * from './node'
export * from './scope'
export * from './types'
export * from './utils'

const GLSL_FRAGMENT_HEAD = `
#version 300 es
precision mediump float;
out vec4 fragColor;
`.trim()

const generateHead = (x: X, c: NodeContext) => {
        const body = code(x, c)
        let head = ''
        if (c.isWebGL && c.code?.dependencies) {
                const sorted = sortHeadersByDependencies(c.code.headers, c.code.dependencies)
                head = sorted.map(([, value]) => value).join('\n')
        } else head = Array.from(c.code?.headers?.values() || []).join('\n')
        return [head, body]
}

const generateStruct = (id: string, map: Map<string, string>) => {
        return `struct ${id} {\n  ${Array.from(map.values()).join(',\n  ')}\n}`
}

export const vertex = (x: X, c: NodeContext) => {
        if (is.str(x)) return x.trim()
        c.code?.headers?.clear()
        c.isFrag = false // for varying inputs or outputs
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
        console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}

export const fragment = (x: X, c: NodeContext) => {
        if (is.str(x)) return x.trim()
        c.code?.headers?.clear()
        c.isFrag = true // for varying inputs or outputs
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
        console.log(`↓↓↓generated↓↓↓\n${main}`)
        return main
}

// Builtin Variables
export const position = builtin('position')
export const vertexIndex = builtin('vertex_index')
export const instanceIndex = builtin('instance_index')
export const frontFacing = builtin('front_facing')
export const fragDepth = builtin('frag_depth')
export const sampleIndex = builtin('sample_index')
export const sampleMask = builtin('sample_mask')
export const pointCoord = builtin('point_coord')

// TSL Compatible Builtin Variables
export const normalLocal = builtin('normalLocal')
export const normalWorld = builtin('normalWorld')
export const normalView = builtin('normalView')
export const positionLocal = builtin('position')
export const positionWorld = builtin('positionWorld')
export const positionView = builtin('positionView')
export const screenCoordinate = builtin('screenCoordinate')
export const screenUV = builtin('screenUV')

// Type constructors with proper type inference
export const float = (x?: X): NodeProxy<'float'> => c('float', x)
export const int = (x?: X): NodeProxy<'int'> => c('int', x)
export const uint = (x?: X): NodeProxy<'uint'> => c('uint', x)
export const bool = (x?: X): NodeProxy<'bool'> => c('bool', x)
export const vec2 = (x?: X, y?: X): NodeProxy<'vec2'> => c('vec2', x, y)
export const vec3 = (x?: X, y?: X, z?: X): NodeProxy<'vec3'> => c('vec3', x, y, z)
export const vec4 = (x?: X, y?: X, z?: X, w?: X): NodeProxy<'vec4'> => c('vec4', x, y, z, w)
export const mat2 = (...args: X[]): NodeProxy<'mat2'> => c('mat2', ...args)
export const mat3 = (...args: X[]): NodeProxy<'mat3'> => c('mat3', ...args)
export const mat4 = (...args: X[]): NodeProxy<'mat4'> => c('mat4', ...args)
export const ivec2 = (x?: X, y?: X): NodeProxy<'ivec2'> => c('ivec2', x, y)
export const ivec3 = (x?: X, y?: X, z?: X): NodeProxy<'ivec3'> => c('ivec3', x, y, z)
export const ivec4 = (x?: X, y?: X, z?: X, w?: X): NodeProxy<'ivec4'> => c('ivec4', x, y, z, w)
export const uvec2 = (x?: X, y?: X): NodeProxy<'uvec2'> => c('uvec2', x, y)
export const uvec3 = (x?: X, y?: X, z?: X): NodeProxy<'uvec3'> => c('uvec3', x, y, z)
export const uvec4 = (x?: X, y?: X, z?: X, w?: X): NodeProxy<'uvec4'> => c('uvec4', x, y, z, w)
export const bvec2 = (x?: X, y?: X): NodeProxy<'bvec2'> => c('bvec2', x, y)
export const bvec3 = (x?: X, y?: X, z?: X): NodeProxy<'bvec3'> => c('bvec3', x, y, z)
export const bvec4 = (x?: X, y?: X, z?: X, w?: X): NodeProxy<'bvec4'> => c('bvec4', x, y, z, w)
export const texture2D = (x?: X): NodeProxy<'texture'> => c('texture', x)
export const sampler2D = (): NodeProxy<'sampler2D'> => c('sampler2D')
export const color = (r?: X, g?: X, b?: X): NodeProxy<'vec3'> => {
        if (is.num(r) && is.und(g) && is.und(b)) return vec3(...hex2rgb(r))
        return vec3(r, g, b)
}

// Default uniforms with proper typing
export const iResolution: NodeProxy<'vec2'> = u(vec2(), 'iResolution')
export const iMouse: NodeProxy<'vec2'> = u(vec2(), 'iMouse')
export const iTime: NodeProxy<'float'> = u(float(), 'iTime')
export const uv = (): NodeProxy<'vec2'> => position.xy.div(iResolution)

// Texture Functions with proper return types
export const texture = (x: X, y: X, z?: X): NodeProxy<'vec4'> => f('texture', x, y, z)
export const cubeTexture = (x: X, y: X, z?: X): NodeProxy<'vec4'> => f('cubeTexture', x, y, z)
export const textureSize = (x: X, y?: X): NodeProxy<'vec4'> => f('textureSize', x, y)

export type Preserve<T extends X, Float extends Constants = 'float'> = T extends NodeProxy<infer U>
        ? NodeProxy<U>
        : NodeProxy<Float>

// Math Functions with proper return type inference
// Preserve type functions (return same type as input)
export const abs = <T extends X>(x: T) => f('abs', x) as Preserve<T>
export const sign = <T extends X>(x: T) => f('sign', x) as Preserve<T>
export const floor = <T extends X>(x: T) => f('floor', x) as Preserve<T>
export const ceil = <T extends X>(x: T) => f('ceil', x) as Preserve<T>
export const round = <T extends X>(x: T) => f('round', x) as Preserve<T>
export const fract = <T extends X>(x: T) => f('fract', x) as Preserve<T>
export const trunc = <T extends X>(x: T) => f('trunc', x) as Preserve<T>
export const sin = <T extends X>(x: T) => f('sin', x) as Preserve<T>
export const cos = <T extends X>(x: T) => f('cos', x) as Preserve<T>
export const tan = <T extends X>(x: T) => f('tan', x) as Preserve<T>
export const asin = <T extends X>(x: T) => f('asin', x) as Preserve<T>
export const acos = <T extends X>(x: T) => f('acos', x) as Preserve<T>
export const atan = <T extends X>(x: T) => f('atan', x) as Preserve<T>
export const exp = <T extends X>(x: T) => f('exp', x) as Preserve<T>
export const exp2 = <T extends X>(x: T) => f('exp2', x) as Preserve<T>
export const log = <T extends X>(x: T) => f('log', x) as Preserve<T>
export const log2 = <T extends X>(x: T) => f('log2', x) as Preserve<T>
export const sqrt = <T extends X>(x: T) => f('sqrt', x) as Preserve<T>
export const inverseSqrt = <T extends X>(x: T) => f('inverseSqrt', x) as Preserve<T>
export const normalize = <T extends X>(x: T) => f('normalize', x) as Preserve<T>
export const oneMinus = <T extends X>(x: T) => f('oneMinus', x) as Preserve<T>
export const saturate = <T extends X>(x: T) => f('saturate', x) as Preserve<T>
export const negate = <T extends X>(x: T) => f('negate', x) as Preserve<T>
export const reciprocal = <T extends X>(x: T) => f('reciprocal', x) as Preserve<T>
export const dFdx = <T extends X>(x: T) => f('dFdx', x) as Preserve<T>
export const dFdy = <T extends X>(x: T) => f('dFdy', x) as Preserve<T>
export const fwidth = <T extends X>(x: T) => f('fwidth', x) as Preserve<T>

// Scalar return functions
export const length = (x: X): NodeProxy<'float'> => f('length', x)
export const lengthSq = (x: X): NodeProxy<'float'> => f('lengthSq', x)
export const distance = (x: X, y: X): NodeProxy<'float'> => f('distance', x, y)
export const dot = (x: X, y: X): NodeProxy<'float'> => f('dot', x, y)

// Bool return functions
export const all = (x: X) => f('all', x) as NodeProxy<'bool'>
export const any = (x: X) => f('any', x) as NodeProxy<'bool'>

// Specific return type functions
export const cross = (x: X, y: X): NodeProxy<'vec3'> => f('cross', x, y)

// Two argument functions with first arg type
export const reflect = <T extends X>(I: T, N: X) => f('reflect', I, N) as Preserve<T>
export const refract = <T extends X>(I: T, N: X, eta: X) => f('refract', I, N, eta) as Preserve<T>

// Multi-argument functions with highest priority type (simplified as first arg type)
export const min = <T extends X>(x: T, y: X) => f('min', x, y) as Preserve<T>
export const max = <T extends X>(x: T, y: X) => f('max', x, y) as Preserve<T>
export const mix = <T extends X>(x: T, y: X, a: X) => f('mix', x, y, a) as Preserve<T>
export const clamp = <T extends X>(x: T, min: X, max: X) => f('clamp', x, min, max) as Preserve<T>
export const step = <T extends X>(edge: X, x: T) => f('step', edge, x) as Preserve<T>
export const smoothstep = <T extends X>(e0: X, e1: X, x: T) => f('smoothstep', e0, e1, x) as Preserve<T>

// Additional functions with variable return types
export const atan2 = <T extends X>(y: T, x: X) => f('atan', y, x) as Preserve<T>
export const pow = <T extends X>(x: T, y: X) => f('pow', x, y) as Preserve<T>
export const pow2 = <T extends X>(x: T) => f('pow2', x) as Preserve<T>
export const pow3 = <T extends X>(x: T) => f('pow3', x) as Preserve<T>
export const pow4 = <T extends X>(x: T) => f('pow4', x) as Preserve<T>

// Utility functions
export const bitcast = <T extends X>(x: T, y: X) => f('bitcast', x, y) as Preserve<T>
export const cbrt = <T extends X>(x: T) => f('cbrt', x) as Preserve<T>
export const degrees = <T extends X>(radians: T) => f('degrees', radians) as Preserve<T>
export const radians = <T extends X>(degrees: T) => f('radians', degrees) as Preserve<T>
export const difference = <T extends X>(x: T, y: X) => f('difference', x, y) as Preserve<T>
export const equals = (x: X, y: X) => f('equals', x, y) as NodeProxy<'bool'>
export const faceforward = <T extends X>(N: T, I: X, Nref: X) => f('faceforward', N, I, Nref) as Preserve<T>
export const transformDirection = <T extends X>(dir: T, matrix: X) =>
        f('transformDirection', dir, matrix) as Preserve<T>
