import { builtin, conversion as c, function_ as f, node, uniform } from './node'
import { hex2rgb } from './utils'
import { is } from '../utils/helpers'
import type { X } from './types'
export * from './code'
export * from './const'
export * from './infer'
export * from './node'
export * from './scope'
export * from './types'
export * from './utils'

// Default uniforms
export const iResolution = uniform([1280, 800], 'iResolution')
export const iMouse = uniform([0, 0], 'iMouse')
export const iTime = uniform(0, 'iTime')

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

// Type constructors
export const float = (x: X) => c('float', x)
export const int = (x: X) => c('int', x)
export const uint = (x: X) => c('uint', x)
export const bool = (x: X) => c('bool', x)
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
export const color = (r?: X, g?: X, b?: X) => {
        if (is.num(r) && is.und(g) && is.und(b)) return vec3(...hex2rgb(r))
        return vec3(r, g, b)
}

// Texture Functions
export const texture = (x: X, y: X, z?: X) => f('texture', x, y, z)
export const cubeTexture = (x: X, y: X, z?: X) => f('cubeTexture', x, y, z)
export const textureSize = (x: X, y?: X) => f('textureSize', x, y)

// Math Functions
export const abs = (x: X) => f('abs', x)
export const acos = (x: X) => f('acos', x)
export const all = (x: X) => f('all', x)
export const any = (x: X) => f('any', x)
export const asin = (x: X) => f('asin', x)
export const atan = (y: X, x?: X) => (x !== undefined ? f('atan', y, x) : f('atan', y))
export const atan2 = (y: X, x: X) => f('atan', y, x)
export const bitcast = (x: X, y: X) => f('bitcast', x, y)
export const cbrt = (x: X) => f('cbrt', x)
export const ceil = (x: X) => f('ceil', x)
export const clamp = (x: X, min: X, max: X) => f('clamp', x, min, max)
export const cos = (x: X) => f('cos', x)
export const cross = (x: X, y: X) => f('cross', x, y)
export const dFdx = (p: X) => f('dFdx', p)
export const dFdy = (p: X) => f('dFdy', p)
export const degrees = (radians: X) => f('degrees', radians)
export const difference = (x: X, y: X) => f('difference', x, y)
export const distance = (x: X, y: X) => f('distance', x, y)
export const dot = (x: X, y: X) => f('dot', x, y)
export const equals = (x: X, y: X) => f('equals', x, y)
export const exp = (x: X) => f('exp', x)
export const exp2 = (x: X) => f('exp2', x)
export const faceforward = (N: X, I: X, Nref: X) => f('faceforward', N, I, Nref)
export const floor = (x: X) => f('floor', x)
export const fract = (x: X) => f('fract', x)
export const fwidth = (x: X) => f('fwidth', x)
export const inverseSqrt = (x: X) => f('inverseSqrt', x)
export const length = (x: X) => f('length', x)
export const lengthSq = (x: X) => f('lengthSq', x)
export const log = (x: X) => f('log', x)
export const log2 = (x: X) => f('log2', x)
export const max = (x: X, y: X) => f('max', x, y)
export const min = (x: X, y: X) => f('min', x, y)
export const mix = (x: X, y: X, a: X) => f('mix', x, y, a)
export const negate = (x: X) => f('negate', x)
export const normalize = (x: X) => f('normalize', x)
export const oneMinus = (x: X) => f('oneMinus', x)
export const pow = (x: X, y: X) => f('pow', x, y)
export const pow2 = (x: X) => f('pow2', x)
export const pow3 = (x: X) => f('pow3', x)
export const pow4 = (x: X) => f('pow4', x)
export const radians = (degrees: X) => f('radians', degrees)
export const reciprocal = (x: X) => f('reciprocal', x)
export const reflect = (I: X, N: X) => f('reflect', I, N)
export const refract = (I: X, N: X, eta: X) => f('refract', I, N, eta)
export const round = (x: X) => f('round', x)
export const saturate = (x: X) => f('saturate', x)
export const sign = (x: X) => f('sign', x)
export const sin = (x: X) => f('sin', x)
export const smoothstep = (e0: X, e1: X, x: X) => f('smoothstep', e0, e1, x)
export const sqrt = (x: X) => f('sqrt', x)
export const step = (edge: X, x: X) => f('step', edge, x)
export const tan = (x: X) => f('tan', x)
export const transformDirection = (dir: X, matrix: X) => f('transformDirection', dir, matrix)
export const trunc = (x: X) => f('trunc', x)
