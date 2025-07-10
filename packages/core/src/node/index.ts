import { is } from '../utils/helpers'
import { code } from './code'
import { builtin, conversion as c, function_ as f, uniform as u } from './node'
import { hex2rgb, sortHeadersByDependencies } from './utils'
import type { Constants as C, NodeContext, X, NodeProxy } from './types'
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
export const position = builtin<'vec4'>('position')
export const vertexIndex = builtin<'uint'>('vertex_index')
export const instanceIndex = builtin<'uint'>('instance_index')
export const frontFacing = builtin<'bool'>('front_facing')
export const fragDepth = builtin<'float'>('frag_depth')
export const sampleIndex = builtin<'uint'>('sample_index')
export const sampleMask = builtin<'uint'>('sample_mask')
export const pointCoord = builtin<'vec2'>('point_coord')

// TSL Compatible Builtin Variables
export const positionLocal = builtin<'vec3'>('position')
export const positionWorld = builtin<'vec3'>('positionWorld')
export const positionView = builtin<'vec3'>('positionView')
export const normalLocal = builtin<'vec3'>('normalLocal')
export const normalWorld = builtin<'vec3'>('normalWorld')
export const normalView = builtin<'vec3'>('normalView')
export const screenCoordinate = builtin<'vec2'>('screenCoordinate')
export const screenUV = builtin<'vec2'>('screenUV')

// Type constructors with proper type inference
export const float = (x?: X) => c('float', x)
export const int = (x?: X) => c('int', x)
export const uint = (x?: X) => c('uint', x)
export const bool = (x?: X) => c('bool', x)
export const vec2 = (x?: X, y?: X) => c('vec2', x, y)
export const vec3 = (x?: X, y?: X, z?: X) => c('vec3', x, y, z)
export const vec4 = (x?: X, y?: X, z?: X, w?: X) => c('vec4', x, y, z, w)
export const mat2 = (...args: X[]) => c('mat2', ...args)
export const mat3 = (...args: X[]) => c('mat3', ...args)
export const mat4 = (...args: X[]) => c('mat4', ...args)
export const ivec2 = (x?: X, y?: X) => c('ivec2', x, y)
export const ivec3 = (x?: X, y?: X, z?: X) => c('ivec3', x, y, z)
export const ivec4 = (x?: X, y?: X, z?: X, w?: X) => c('ivec4', x, y, z, w)
export const uvec2 = (x?: X, y?: X) => c('uvec2', x, y)
export const uvec3 = (x?: X, y?: X, z?: X) => c('uvec3', x, y, z)
export const uvec4 = (x?: X, y?: X, z?: X, w?: X) => c('uvec4', x, y, z, w)
export const bvec2 = (x?: X, y?: X) => c('bvec2', x, y)
export const bvec3 = (x?: X, y?: X, z?: X) => c('bvec3', x, y, z)
export const bvec4 = (x?: X, y?: X, z?: X, w?: X) => c('bvec4', x, y, z, w)
export const texture2D = (x?: X) => c('texture', x)
export const sampler2D = () => c('sampler2D')
export const color = (r?: X, g?: X, b?: X) => {
        if (is.num(r) && is.und(g) && is.und(b)) return vec3(...hex2rgb(r))
        return vec3(r, g, b)
}

// Default uniforms with proper typing
export const iResolution: NodeProxy<'vec2'> = u(vec2(), 'iResolution')
export const iMouse: NodeProxy<'vec2'> = u(vec2(), 'iMouse')
export const iTime: NodeProxy<'float'> = u(float(), 'iTime')
export const uv = position.xy.div(iResolution)

// Texture Functions with proper return types
export const texture = (x: X, y: X, z?: X) => f<'vec4'>('texture', x, y, z)
export const cubeTexture = (x: X, y: X, z?: X) => f<'vec4'>('cubeTexture', x, y, z)
export const textureSize = (x: X, y?: X) => f<'vec4'>('textureSize', x, y)

// Math Functions with proper return type inference
export const abs = <T extends C>(x: X<T>) => f<T>('abs', x)
export const sign = <T extends C>(x: X<T>) => f<T>('sign', x)
export const floor = <T extends C>(x: X<T>) => f<T>('floor', x)
export const ceil = <T extends C>(x: X<T>) => f<T>('ceil', x)
export const round = <T extends C>(x: X<T>) => f<T>('round', x)
export const fract = <T extends C>(x: X<T>) => f<T>('fract', x)
export const trunc = <T extends C>(x: X<T>) => f<T>('trunc', x)
export const sin = <T extends C>(x: X<T>) => f<T>('sin', x)
export const cos = <T extends C>(x: X<T>) => f<T>('cos', x)
export const tan = <T extends C>(x: X<T>) => f<T>('tan', x)
export const asin = <T extends C>(x: X<T>) => f<T>('asin', x)
export const acos = <T extends C>(x: X<T>) => f<T>('acos', x)
export const atan = <T extends C>(x: X<T>) => f<T>('atan', x)
export const exp = <T extends C>(x: X<T>) => f<T>('exp', x)
export const exp2 = <T extends C>(x: X<T>) => f<T>('exp2', x)
export const log = <T extends C>(x: X<T>) => f<T>('log', x)
export const log2 = <T extends C>(x: X<T>) => f<T>('log2', x)
export const sqrt = <T extends C>(x: X<T>) => f<T>('sqrt', x)
export const inverseSqrt = <T extends C>(x: X<T>) => f<T>('inverseSqrt', x)
export const normalize = <T extends C>(x: X<T>) => f<T>('normalize', x)
export const oneMinus = <T extends C>(x: X<T>) => f<T>('oneMinus', x)
export const saturate = <T extends C>(x: X<T>) => f<T>('saturate', x)
export const negate = <T extends C>(x: X<T>) => f<T>('negate', x)
export const reciprocal = <T extends C>(x: X<T>) => f<T>('reciprocal', x)
export const dFdx = <T extends C>(x: X<T>) => f<T>('dFdx', x)
export const dFdy = <T extends C>(x: X<T>) => f<T>('dFdy', x)
export const fwidth = <T extends C>(x: X<T>) => f<T>('fwidth', x)

// Scalar return functions
export const length = (x: X) => f<'float'>('length', x)
export const lengthSq = (x: X) => f<'float'>('lengthSq', x)
export const distance = (x: X, y: X) => f<'float'>('distance', x, y)
export const dot = (x: X, y: X) => f<'float'>('dot', x, y)

// Bool return functions
export const all = <T extends C>(x: X<T>) => f<'bool'>('all', x)
export const any = <T extends C>(x: X<T>) => f<'bool'>('any', x)

// Specific return type functions
export const cross = <T extends C>(x: X<T>, y: X<T>) => f<'vec3'>('cross', x, y)

// Two argument functions with first arg type
export const reflect = <T extends C>(I: X, N: X) => f<T>('reflect', I, N)
export const refract = <T extends C>(I: X, N: X, eta: X) => f<T>('refract', I, N, eta)

// Multi-argument functions with highest priority type (simplified as first arg type)
export const min = <T extends C>(x: X<T>, y: X) => f<T>('min', x, y)
export const max = <T extends C>(x: X<T>, y: X) => f<T>('max', x, y)
export const mix = <T extends C>(x: X<T>, y: X, a: X) => f<T>('mix', x, y, a)
export const clamp = <T extends C>(x: X<T>, min: X, max: X) => f<T>('clamp', x, min, max)
export const step = <T extends C>(edge: X, x: X<T>) => f<T>('step', edge, x)
export const smoothstep = <T extends C>(e0: X, e1: X, x: X<T>) => f<T>('smoothstep', e0, e1, x)

// Additional functions with variable return types
export const atan2 = <T extends C>(y: X, x: X) => f<T>('atan', y, x)
export const pow = <T extends C>(x: X<T>, y: X) => f<T>('pow', x, y)
export const pow2 = <T extends C>(x: X<T>) => f<T>('pow2', x)
export const pow3 = <T extends C>(x: X<T>) => f<T>('pow3', x)
export const pow4 = <T extends C>(x: X<T>) => f<T>('pow4', x)

// Utility functions
export const bitcast = <T extends C>(x: X<T>, y: X) => f<T>('bitcast', x, y)
export const cbrt = <T extends C>(x: X<T>) => f<T>('cbrt', x)
export const degrees = <T extends C>(radians: X) => f<T>('degrees', radians)
export const radians = <T extends C>(degrees: X) => f<T>('radians', degrees)
export const difference = <T extends C>(x: X<T>, y: X) => f<T>('difference', x, y)
export const equals = (x: X, y: X): NodeProxy<'bool'> => f('equals', x, y)
export const faceforward = <T extends C>(N: X, I: X, Nref: X) => f<T>('faceforward', N, I, Nref)
export const transformDirection = <T extends C>(dir: X, matrix: X) => f<T>('transformDirection', dir, matrix)
