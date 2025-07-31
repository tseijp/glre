import { hex2rgb } from './utils'
import { builtin as b, conversion as c, function_ as f, uniform as u } from './node'
import { is } from '../utils/helpers'
import type { Constants as C, Float, X, NodeProxy } from './types'
export * from './core'
export * from './node'
export * from './scope'
export * from './types'

// Builtin Variables
export const position = b<'vec4'>('position')
export const vertexIndex = b<'uint'>('vertex_index')
export const instanceIndex = b<'uint'>('instance_index')
export const frontFacing = b<'bool'>('front_facing')
export const fragDepth = b<'float'>('frag_depth')
export const sampleIndex = b<'uint'>('sample_index')
export const sampleMask = b<'uint'>('sample_mask')
export const pointCoord = b<'vec2'>('point_coord')
export const id = b<'vec3'>('global_invocation_id')

// TSL Compatible Builtin Variables
export const positionLocal = b<'vec3'>('position')
export const positionWorld = b<'vec3'>('positionWorld')
export const positionView = b<'vec3'>('positionView')
export const normalLocal = b<'vec3'>('normalLocal')
export const normalWorld = b<'vec3'>('normalWorld')
export const normalView = b<'vec3'>('normalView')
export const screenCoordinate = b<'vec2'>('screenCoordinate')
export const screenUV = b<'vec2'>('screenUV')

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
export const iResolution = u(vec2(), 'iResolution')
export const iMouse = u(vec2(), 'iMouse')
export const iTime = u(float(), 'iTime')
export const uv = position.xy.div(iResolution)

/**
 * 1.1. unified with:
 * 2.1. const.ts BUILTIN_VARIABLES and
 * 3.1. types.ts BaseNodeProxy
 */
// 0. Always return bool
export const all = <T extends C>(x: X<T>) => f<'bool'>('all', x)
export const any = <T extends C>(x: X<T>) => f<'bool'>('any', x)

// 2. Always return float with WGSL-compliant type constraints
export const length = <T extends 'float' | 'vec2' | 'vec3' | 'vec4'>(x: X<T>) => f<'float'>('length', x)
export const lengthSq = (x: X) => f<'float'>('lengthSq', x)
export const distance = <T extends 'vec2' | 'vec3' | 'vec4'>(x: X<T>, y: X<T>) => f<'float'>('distance', x, y)
export const dot = <T extends 'vec2' | 'vec3' | 'vec4' | 'ivec2' | 'ivec3' | 'ivec4'>(x: X<T>, y: X<T>) =>
        f<T extends `ivec${string}` ? 'int' : 'float'>('dot', x, y)

// 3. Always return vec3
export const cross = (x: X<'vec3'>, y: X<'vec3'>) => f<'vec3'>('cross', x, y)

// 4. Always return vec4
export const cubeTexture = (x: X, y: X, z?: X) => f<'vec4'>('cubeTexture', x, y, z)
export const texture = (x: X, y: X, z?: X) => f<'vec4'>('texture', x, y, z)
export const texelFetch = (x: X, y: X, z?: X) => f<'vec4'>('texelFetch', x, y, z)
export const textureLod = (x: X, y: X, z?: X) => f<'vec4'>('textureLod', x, y, z)

/**
 * 1.2. unified with:
 * 2.2. const.ts FUNCTIONS and
 * 3.2. types.ts BaseNodeProxy
 */
// 0. Component-wise functions
export const abs = <T extends C>(x: X<T>) => f<T>('abs', x)
export const acos = <T extends C>(x: X<T>) => f<T>('acos', x)
export const acosh = <T extends C>(x: X<T>) => f<T>('acosh', x)
export const asin = <T extends C>(x: X<T>) => f<T>('asin', x)
export const asinh = <T extends C>(x: X<T>) => f<T>('asinh', x)
export const atan = <T extends C>(x: X<T>) => f<T>('atan', x)
export const atanh = <T extends C>(x: X<T>) => f<T>('atanh', x)
export const ceil = <T extends C>(x: X<T>) => f<T>('ceil', x)
export const cos = <T extends C>(x: X<T>) => f<T>('cos', x)
export const cosh = <T extends C>(x: X<T>) => f<T>('cosh', x)
export const dFdx = <T extends C>(x: X<T>) => f<T>('dFdx', x)
export const dFdy = <T extends C>(x: X<T>) => f<T>('dFdy', x)
export const degrees = <T extends C>(x: X<T>) => f<T>('degrees', x)
export const exp = <T extends C>(x: X<T>) => f<T>('exp', x)
export const exp2 = <T extends C>(x: X<T>) => f<T>('exp2', x)
export const floor = <T extends C>(x: X<T>) => f<T>('floor', x)
export const fract = <T extends C>(x: X<T>) => f<T>('fract', x)
export const fwidth = <T extends C>(x: X<T>) => f<T>('fwidth', x)
export const inverseSqrt = <T extends C>(x: X<T>) => f<T>('inverseSqrt', x)
export const log = <T extends C>(x: X<T>) => f<T>('log', x)
export const log2 = <T extends C>(x: X<T>) => f<T>('log2', x)
export const negate = <T extends C>(x: X<T>) => f<T>('negate', x)
export const normalize = <T extends 'vec2' | 'vec3' | 'vec4'>(x: X<T>) => f<T>('normalize', x)
export const oneMinus = <T extends C>(x: X<T>) => f<T>('oneMinus', x)
export const radians = <T extends C>(x: X<T>) => f<T>('radians', x)
export const reciprocal = <T extends C>(x: X<T>) => f<T>('reciprocal', x)
export const round = <T extends C>(x: X<T>) => f<T>('round', x)
export const saturate = <T extends C>(x: X<T>) => f<T>('saturate', x)
export const sign = <T extends C>(x: X<T>) => f<T>('sign', x)
export const sin = <T extends C>(x: X<T>) => f<T>('sin', x)
export const sinh = <T extends C>(x: X<T>) => f<T>('sinh', x)
export const sqrt = <T extends C>(x: X<T>) => f<T>('sqrt', x)
export const tan = <T extends C>(x: X<T>) => f<T>('tan', x)
export const tanh = <T extends C>(x: X<T>) => f<T>('tanh', x)
export const trunc = <T extends C>(x: X<T>) => f<T>('trunc', x)

// 1. Functions where first argument determines return type with constraints
export const atan2 = <T extends C>(x: X<T>, y: X<T>) => f<T>('atan2', x, y)
export const clamp = <T extends C>(x: X<T>, y: X<T>, z: X<T>) => f<T>('clamp', x, y, z)
export const max = <T extends C>(x: X<T>, y: X<T>) => f<T>('max', x, y)
export const min = <T extends C>(x: X<T>, y: X<T>) => f<T>('min', x, y)
export const mix = <T extends C>(x: X<T>, y: X<T>, a: Float) => f<T>('mix', x, y, a)
export const pow = <T extends C>(x: X<T>, y: X<T>) => f<T>('pow', x, y)
export const reflect = <T extends 'vec2' | 'vec3' | 'vec4'>(I: X<T>, N: X<T>) => f<T>('reflect', I, N)
export const refract = <T extends 'vec2' | 'vec3' | 'vec4'>(I: X<T>, N: X<T>, eta: Float) => f<T>('refract', I, N, eta)

// 2. Functions where not first argument determines return type
export const smoothstep = <T extends C>(e0: X<T>, e1: X<T>, x: Float) => f<T>('smoothstep', e0, e1, x)
export const step = <T extends C>(edge: X<T> | Float, x: X<T>) => f<T>('step', edge, x)
export const mod = <T extends C>(x: NodeProxy<T>, y: X<T>) => x.sub(x.div(y).toFloat().floor().mul(y))
