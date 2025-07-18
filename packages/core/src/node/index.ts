import { hex2rgb } from './utils'
import { builtin as b, conversion as c, function_ as f, uniform as u } from './node'
import { is } from '../utils/helpers'
import type { Constants as C, X, Vec2, Float, NodeProxy } from './types'
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
export const iResolution: Vec2 = u(vec2(), 'iResolution')
export const iMouse: Vec2 = u(vec2(), 'iMouse')
export const iTime: Float = u(float(), 'iTime')
export const uv = position.xy.div(iResolution)

// Texture Functions - always return vec4
export const texture = (x: X, y: X, z?: X) => f<'vec4'>('texture', x, y, z)
export const cubeTexture = (x: X, y: X, z?: X) => f<'vec4'>('cubeTexture', x, y, z)
export const textureSize = (x: X, y?: X) => f<'vec4'>('textureSize', x, y)

// Functions that always return float regardless of input
export const length = (x: X) => f<'float'>('length', x)
export const lengthSq = (x: X) => f<'float'>('lengthSq', x)
export const distance = (x: X, y: X) => f<'float'>('distance', x, y)
export const dot = (x: X, y: X) => f<'float'>('dot', x, y)

// Functions that always return bool
export const all = <T extends C>(x: X<T>) => f<'bool'>('all', x)
export const any = <T extends C>(x: X<T>) => f<'bool'>('any', x)

// Functions that always return vec3 (cross product only works with vec3)
export const cross = (x: X<'vec3'>, y: X<'vec3'>) => f<'vec3'>('cross', x, y)

// Component-wise functions - preserve input type (T -> T)
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
export const sinh = <T extends C>(x: X<T>) => f<T>('sinh', x)
export const cosh = <T extends C>(x: X<T>) => f<T>('cosh', x)
export const tanh = <T extends C>(x: X<T>) => f<T>('tanh', x)
export const asinh = <T extends C>(x: X<T>) => f<T>('asinh', x)
export const acosh = <T extends C>(x: X<T>) => f<T>('acosh', x)
export const atanh = <T extends C>(x: X<T>) => f<T>('atanh', x)
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
export const degrees = <T extends C>(x: X<T>) => f<T>('degrees', x)
export const radians = <T extends C>(x: X<T>) => f<T>('radians', x)

// Functions where first argument determines return type
export const reflect = <T extends C>(I: X<T>, N: X) => f<T>('reflect', I, N)
export const refract = <T extends C>(I: X<T>, N: X, eta: X) => f<T>('refract', I, N, eta)

// Functions with highest priority type among arguments (using first arg for simplicity)
export const min = <T extends C>(x: X<T>, y: X) => f<T>('min', x, y)
export const max = <T extends C>(x: X<T>, y: X) => f<T>('max', x, y)
export const mix = <T extends C>(x: X<T>, y: X, a: X) => f<T>('mix', x, y, a)
export const clamp = <T extends C>(x: X<T>, minVal: X, maxVal: X) => f<T>('clamp', x, minVal, maxVal)
export const step = <T extends C>(edge: X, x: X<T>) => f<T>('step', edge, x)
export const smoothstep = <T extends C>(e0: X, e1: X, x: X<T>) => f<T>('smoothstep', e0, e1, x)

// Two-argument functions with highest priority type
export const atan2 = <T extends C>(y: X<T>, x: X) => f<T>('atan2', y, x)
export const pow = <T extends C>(x: X<T>, y: X) => f<T>('pow', x, y)

// Component-wise power functions
export const pow2 = <T extends C>(x: X<T>) => f<T>('pow2', x)
export const pow3 = <T extends C>(x: X<T>) => f<T>('pow3', x)
export const pow4 = <T extends C>(x: X<T>) => f<T>('pow4', x)

// Utility functions
export const bitcast = <T extends C>(x: X<T>, y: X) => f<T>('bitcast', x, y)
export const cbrt = <T extends C>(x: X<T>) => f<T>('cbrt', x)
export const difference = <T extends C>(x: X<T>, y: X) => f<T>('difference', x, y)
export const equals = (x: X, y: X) => f<'bool'>('equals', x, y)
export const faceforward = <T extends C>(N: X<T>, I: X, Nref: X) => f<T>('faceforward', N, I, Nref)
export const transformDirection = <T extends C>(dir: X<T>, matrix: X) => f<T>('transformDirection', dir, matrix)
export const mod = <T extends C>(x: NodeProxy<T>, y: X<T>) => x.sub(x.div(y).floor().mul(y))
